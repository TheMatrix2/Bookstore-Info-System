package interfaces

import (
	"context"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"github.com/google/uuid"
)

type CategoryRepositoryInterface interface {
	Create(ctx context.Context, category *models.Category) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.Category, error)
	GetAll(ctx context.Context) ([]models.Category, error)
	Update(ctx context.Context, category *models.Category) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type CategoryServiceInterface interface {
	Create(ctx context.Context, name string) (*models.Category, error)
	GetByID(ctx context.Context, id uuid.UUID) (*models.Category, error)
	GetAll(ctx context.Context) ([]models.Category, error)
	Update(ctx context.Context, id uuid.UUID, name string) (*models.Category, error)
	Delete(ctx context.Context, id uuid.UUID) error
}