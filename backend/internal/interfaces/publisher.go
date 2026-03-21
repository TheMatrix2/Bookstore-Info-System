package interfaces

import (
	"context"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/dto"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"github.com/google/uuid"
)

//go:generate mockgen -destination=../../mocks/mock_publisher_repo.go -package=mocks github.com/TheMatrix2/Bookstore-Info-System/backend/internal/interfaces PublisherRepositoryInterface
type PublisherRepositoryInterface interface {
	Create(ctx context.Context, author *models.Publisher) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.Publisher, error)
	GetAll(ctx context.Context) ([]models.Publisher, error)
	Update(ctx context.Context, author *models.Publisher) error
	Delete(ctx context.Context, id uuid.UUID) error
}

//go:generate mockgen -destination=../../mocks/mock_publisher_service.go -package=mocks github.com/TheMatrix2/Bookstore-Info-System/backend/internal/interfaces PublisherServiceInterface
type PublisherServiceInterface interface {
	Create(ctx context.Context, input dto.PublisherInput) (*models.Publisher, error)
	GetByID(ctx context.Context, id uuid.UUID) (*models.Publisher, error)
	GetAll(ctx context.Context) ([]models.Publisher, error)
	Update(ctx context.Context, id uuid.UUID, input dto.PublisherInput) (*models.Publisher, error)
	Delete(ctx context.Context, id uuid.UUID) error
}