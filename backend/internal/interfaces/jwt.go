package interfaces

import (
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

//go:generate mockgen -destination=../../mocks/mock_jwt.go -package=mocks github.com/TheMatrix2/Bookstore-Info-System/backend/internal/interfaces JWTServiceInterface
type JWTServiceInterface interface {
	GenerateToken(userID uuid.UUID, role string) (string, error)
	ValidateToken(tokenString string) (*Token, error)
}

type Token struct {
	UserID uuid.UUID `json:"user_id"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}