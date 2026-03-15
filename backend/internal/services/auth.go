package services

import (
	"context"
	"fmt"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/apperrors"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/dto"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/interfaces"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userRepo interfaces.UserRepositoryInterface
}

func NewAuthService(userRepo interfaces.UserRepositoryInterface) *AuthService {
	return &AuthService{userRepo: userRepo}
}

func (s *AuthService) Register(ctx context.Context, req dto.RegisterRequest) (*dto.AuthResponse, error) {
	model, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, apperrors.ErrInternal(err)
	}
	if model != nil {
		return nil, apperrors.ErrConflict("user with this email already exists")
	}

	model, err = s.userRepo.GetByUsername(ctx, req.Username)
	if err != nil {
		return nil, apperrors.ErrInternal(err)
	}
	if model != nil {
		return nil, apperrors.ErrConflict("user with this username already exists")
	}

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

	return &dto.AuthResponse{Token: token}, nil
}

func (s *AuthService) Login(ctx context.Context, req dto.LoginRequest) (*dto.AuthResponse, error) {
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

	return &dto.AuthResponse{Token: token}, nil
}