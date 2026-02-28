package services

import (
	"context"
	"fmt"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/repository"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userRepo *repository.UserRepository
}

func NewAuthService(userRepo *repository.UserRepository) *AuthService {
	return &AuthService{userRepo: userRepo}
}

type RegisterRequest struct {
	Username string `json:"username" validate:"required,min=3,max=50"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type AuthResponse struct {
    Token 	string 	`json:"token"`
}

func (s *AuthService) Register(ctx context.Context, req RegisterRequest) (*AuthResponse, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	role, err := s.userRepo.GetRoleByName(ctx, "user")
    if err != nil {
        return nil, fmt.Errorf("failed to get role: %w", err)
    }

	user := &models.User{
		Username: 		req.Username,
		Email:    		req.Email,
		PasswordHash: 	string(hash),
		RoleID: 		role.ID,
	}
	
	err = s.userRepo.Create(ctx, user)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	token, err := GenerateToken(user.ID, role.Name)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return &AuthResponse{Token: token}, nil
}

func (s *AuthService) Login(ctx context.Context, req LoginRequest) (*AuthResponse, error) {
	user, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, fmt.Errorf("invalid credentials: %w", err)
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, fmt.Errorf("invalid password: %w", err)
	}

	role := ""
	if user.Role != nil {
		role = user.Role.Name
	}

	token, err := GenerateToken(user.ID, role)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return &AuthResponse{Token: token}, nil
}