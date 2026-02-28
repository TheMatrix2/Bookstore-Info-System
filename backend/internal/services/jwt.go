package services

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type EnvJWT struct {
	Secret 		string 	`env:"JWT_SECRET"`
	Expiration 	int		`env:"JWT_EXPIRATION"`
}

type Token struct {
	UserID	uuid.UUID	`json:"user_id"`
	Role	string		`json:"role"`
	jwt.RegisteredClaims
}

func (e *EnvJWT) LoadFromEnv() error {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return fmt.Errorf("JWT_SECRET is not set")
	}
	expiration, error := strconv.Atoi(os.Getenv("JWT_EXPIRATION"))
	if error != nil {
		return fmt.Errorf("JWT_EXPIRATION is not set or invalid: %w", error)
	}

	e.Secret = secret
	e.Expiration = expiration
	return nil
}

func GenerateToken(userID uuid.UUID, role string) (string, error) {
	environment := &EnvJWT{}
	if err := environment.LoadFromEnv(); err != nil {
		return "", fmt.Errorf("failed to load JWT configuration: %w", err)
	}

	secret := environment.Secret
	expiration := environment.Expiration

	claims := Token{
		UserID: userID,
		Role: role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(expiration) * time.Hour)),
			IssuedAt: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func ValidateToken(tokenString string) (*Token, error) {
	environment := &EnvJWT{}
	if err := environment.LoadFromEnv(); err != nil {
		return nil, fmt.Errorf("failed to load JWT configuration: %w", err)
	}

	token, err := jwt.ParseWithClaims(tokenString, &Token{}, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(environment.Secret), nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse JWT token: %w", err)
	}

	claims, ok := token.Claims.(*Token)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid JWT token")
	}

	return claims, nil
}