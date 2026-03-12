package services

import (
	"context"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/apperrors"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/repository"
	"github.com/google/uuid"
)

type UserService struct {
	userRepo *repository.UserRepository
}

func NewUserService(userRepo *repository.UserRepository) *UserService {
	return &UserService{userRepo: userRepo}
}

type UpdateUserRequest struct {
	Username string `json:"username" validate:"required,min=3,max=50"`
	Email    string `json:"email" validate:"required,email"`
	Phone   *string `json:"phone,omitempty" validate:"e164"`
}

func (s *UserService) GetAllCustomers(ctx context.Context) ([]models.User, error) {
	users, err := s.userRepo.GetAllCustomers(ctx)
	if err != nil {
		return nil, apperrors.ErrInternal(err)
	}
	return users, nil
}

func (s *UserService) GetAllEmployees(ctx context.Context) ([]models.User, error) {
	users, err := s.userRepo.GetAllEmployees(ctx)
	if err != nil {
		return nil, apperrors.ErrInternal(err)
	}
	return users, nil
}

func (s *UserService) GetByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	user, err := s.userRepo.GetByID(ctx, id)
	if err != nil {
		return nil, apperrors.ErrNotFound("user not found")
	}
	return user, nil
}

func (s *UserService) Update(ctx context.Context, id uuid.UUID, req UpdateUserRequest) (*models.User, error) {
    user, err := s.userRepo.GetByID(ctx, id)
    if err != nil {
        return nil, apperrors.ErrNotFound("user not found")
    }

	if req.Username != "" {
		user.Username = req.Username
	}
	if req.Email != "" {
		user.Email = req.Email
	}
	if req.Phone != nil {
		user.Phone = req.Phone
	}

	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, apperrors.ErrInternal(err)
	}
	return user, nil
}

func (s *UserService) Delete(ctx context.Context, id uuid.UUID) error {
	user, err := s.userRepo.GetByID(ctx, id)
    if err != nil {
        return apperrors.ErrNotFound("user not found")
    }

	if err := s.userRepo.Delete(ctx, user); err != nil {
		return apperrors.ErrInternal(err)
	}
	return nil
}