package interfaces

import (
    "context"

    "github.com/TheMatrix2/Bookstore-Info-System/backend/internal/dto"
)

//go:generate mockgen -destination=../../mocks/mock_auth_service.go -package=mocks github.com/TheMatrix2/Bookstore-Info-System/backend/internal/interfaces AuthServiceInterface
type AuthServiceInterface interface {
    Register(ctx context.Context, req dto.RegisterRequest) (*dto.AuthResponse, error)
    Login(ctx context.Context, req dto.LoginRequest) (*dto.AuthResponse, error)
}