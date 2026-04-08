package services

import (
	"context"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/apperrors"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/dto"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/interfaces"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"github.com/google/uuid"
)

type BookService struct {
	repo interfaces.BookRepositoryInterface
}

func NewBookService(repo interfaces.BookRepositoryInterface) *BookService {
	return &BookService{repo: repo}
}

func (s *BookService) Create(ctx context.Context, input dto.BookInput) (*models.Book, error) {
	book := &models.Book{
		Title: input.Title,
		Description: input.Description,
		Price: input.Price,
		Stock: input.Stock,
		AuthorID: input.AuthorID,
		PublisherID: input.PublisherID,
	}
	if err := s.repo.Create(ctx, book, input.CategoryIDs); err != nil {
		return nil, apperrors.ErrInternal(err)
	}
	return book, nil
}

func (s *BookService) GetByID(ctx context.Context, id uuid.UUID) (*models.Book, error) {
	book, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, apperrors.ErrNotFound("book not found")
	}
	return book, nil
}

func (s *BookService) GetAll(ctx context.Context, filter dto.BookFilter) ([]models.Book, error) {
	books, err := s.repo.GetAll(ctx, filter)
	if err != nil {
		return nil, apperrors.ErrInternal(err)
	}
	return books, nil
}

func (s *BookService) Update(ctx context.Context, id uuid.UUID, input dto.BookInput) (*models.Book, error) {
	book, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, apperrors.ErrNotFound("book not found")
	}
	book.Title = input.Title
	book.Description = input.Description
	book.Price = input.Price
	book.Stock = input.Stock
	book.AuthorID = input.AuthorID
	book.PublisherID = input.PublisherID

	if err := s.repo.Update(ctx, book, input.CategoryIDs); err != nil {
		return nil, apperrors.ErrInternal(err)
	}
	return book, nil
}

func (s *BookService) Delete(ctx context.Context, id uuid.UUID) error {
	if _, err := s.repo.GetByID(ctx, id); err != nil {
		return apperrors.ErrNotFound("book not found")
	}
	
	if err := s.repo.Delete(ctx, id); err != nil {
		return apperrors.ErrInternal(err)
	}
	return nil
}