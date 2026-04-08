package interfaces

import (
	"context"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/dto"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"github.com/google/uuid"
)

type BookRepositoryInterface interface {
	Create(ctx context.Context, book *models.Book, categoryIDs []uuid.UUID) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.Book, error)
	GetAll(ctx context.Context, filter dto.BookFilter) ([]models.Book, error)
	Update(ctx context.Context, author *models.Book, CategoryIDs []uuid.UUID) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type BookServiceInterface interface {
	Create(ctx context.Context, input dto.BookInput) (*models.Book, error)
	GetByID(ctx context.Context, id uuid.UUID) (*models.Book, error)
	GetAll(ctx context.Context, filter dto.BookFilter) ([]models.Book, error)
	Update(ctx context.Context, id uuid.UUID, input dto.BookInput) (*models.Book, error)
	Delete(ctx context.Context, id uuid.UUID) error
}