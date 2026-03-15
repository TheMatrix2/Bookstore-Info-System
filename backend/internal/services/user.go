package services

import (
	"context"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/apperrors"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/dto"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/interfaces"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"github.com/google/uuid"
)

type UserService struct {
	userRepo interfaces.UserRepositoryInterface
}

func NewUserService(userRepo interfaces.UserRepositoryInterface) *UserService {
	return &UserService{userRepo: userRepo}
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

func (s *UserService) Update(ctx context.Context, id uuid.UUID, req dto.UpdateUserRequest) (*models.User, error) {
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