package services

import (
	"fmt"
	"time"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/interfaces"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type JWTService struct {
	Secret 		string
	Expiration 	int
}

func NewJWTService(secret string, expiration int) *JWTService {
	return &JWTService{
		Secret:     secret,
		Expiration: expiration,
	}
}

func (j *JWTService) GenerateToken(userID uuid.UUID, role string) (string, error) {
	claims := interfaces.Token{
		UserID: userID,
		Role: role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(j.Expiration) * time.Hour)),
			IssuedAt: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(j.Secret))
}

func (j *JWTService) ValidateToken(tokenString string) (*interfaces.Token, error) {
	token, err := jwt.ParseWithClaims(tokenString, &interfaces.Token{}, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(j.Secret), nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse JWT token: %w", err)
	}

	claims, ok := token.Claims.(*interfaces.Token)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid JWT token")
	}

	return claims, nil
}