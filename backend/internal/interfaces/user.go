package interfaces

import (
	"context"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/dto"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"github.com/google/uuid"
)

//go:generate mockgen -destination=../../mocks/mock_user_repo.go -package=mocks github.com/TheMatrix2/Bookstore-Info-System/backend/internal/interfaces UserRepositoryInterface
type UserRepositoryInterface interface {
	Create(ctx context.Context, user *models.User) error
	GetRoleByName(ctx context.Context, name string) (*models.Role, error)
	GetAllCustomers(ctx context.Context) ([]models.User, error)
	GetAllEmployees(ctx context.Context) ([]models.User, error)
	GetByID(ctx context.Context, id uuid.UUID) (*models.User, error)
	GetByUsername(ctx context.Context, username string) (*models.User, error)
	GetByEmail(ctx context.Context, email string) (*models.User, error)
	Update(ctx context.Context, user *models.User) error
	Delete(ctx context.Context, user *models.User) error
}

//go:generate mockgen -destination=../../mocks/mock_user_service.go -package=mocks github.com/TheMatrix2/Bookstore-Info-System/backend/internal/interfaces UserServiceInterface
type UserServiceInterface interface {
    GetAllCustomers(ctx context.Context) ([]models.User, error)
    GetAllEmployees(ctx context.Context) ([]models.User, error)
    GetByID(ctx context.Context, id uuid.UUID) (*models.User, error)
    Update(ctx context.Context, id uuid.UUID, req dto.UpdateUserRequest) (*models.User, error)
    Delete(ctx context.Context, id uuid.UUID) error
}