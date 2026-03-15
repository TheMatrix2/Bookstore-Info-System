package interfaces

import (
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type JWTServiceInterface interface {
	GenerateToken(userID uuid.UUID, role string) (string, error)
	ValidateToken(tokenString string) (*Token, error)
}

type Token struct {
	UserID uuid.UUID `json:"user_id"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}