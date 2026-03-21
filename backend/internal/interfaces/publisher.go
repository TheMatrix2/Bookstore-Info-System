package interfaces

import (
	"context"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/dto"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"github.com/google/uuid"
)

//go:generate mockgen -destination=../../mocks/mock_author_repo.go -package=mocks github.com/TheMatrix2/Bookstore-Info-System/backend/internal/interfaces AuthorRepositoryInterface
type PublisherRepositoryInterface interface {
	Create(ctx context.Context, author *models.Publisher) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.Publisher, error)
	GetAll(ctx context.Context) ([]models.Publisher, error)
	Update(ctx context.Context, author *models.Publisher) error
	Delete(ctx context.Context, id uuid.UUID) error
}

//go:generate mockgen -destination=../../mocks/mock_author_service.go -package=mocks github.com/TheMatrix2/Bookstore-Info-System/backend/internal/interfaces AuthorServiceInterface
// type AuthorServiceInterface interface {
// 	Create(ctx context.Context, input dto.AuthorInput) (*models.Author, error)
// 	GetByID(ctx context.Context, id uuid.UUID) (*models.Author, error)
// 	GetAll(ctx context.Context) ([]models.Author, error)
// 	Update(ctx context.Context, id uuid.UUID, input dto.AuthorInput) (*models.Author, error)
// 	Delete(ctx context.Context, id uuid.UUID) error
// }