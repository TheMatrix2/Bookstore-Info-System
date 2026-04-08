package services

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/apperrors"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/dto"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/interfaces"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userRepo   interfaces.UserRepositoryInterface
	jwtService interfaces.JWTServiceInterface
}

func NewAuthService(userRepo interfaces.UserRepositoryInterface, jwtService interfaces.JWTServiceInterface) *AuthService {
	return &AuthService{userRepo: userRepo, jwtService: jwtService}
}

func (s *AuthService) Register(ctx context.Context, req dto.RegisterRequest) (*dto.AuthResponse, error) {
	existing, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, apperrors.ErrInternal(err)
	}
	if existing != nil {
		return nil, apperrors.ErrConflict("user with this email already exists")
	}

	existing, err = s.userRepo.GetByUsername(ctx, req.Username)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, apperrors.ErrInternal(err)
	}
	if existing != nil {
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
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: string(hash),
		RoleID:       role.ID,
	}

	if err = s.userRepo.Create(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	token, err := s.jwtService.GenerateToken(user.ID, role.Name)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return &dto.AuthResponse{Token: token}, nil
}

func (s *AuthService) Login(ctx context.Context, req dto.LoginRequest) (*dto.AuthResponse, error) {
	user, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, apperrors.ErrUnauthorized("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, apperrors.ErrUnauthorized("invalid credentials")
	}

	role := ""
	if user.Role != nil {
		role = user.Role.Name
	}

	token, err := s.jwtService.GenerateToken(user.ID, role)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return &dto.AuthResponse{Token: token}, nil
}