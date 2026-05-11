package services

import (
	"context"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/apperrors"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/interfaces"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"github.com/google/uuid"
)

type CategoryService struct {
	repo interfaces.CategoryRepositoryInterface
}

func NewCategoryService(repo interfaces.CategoryRepositoryInterface) *CategoryService {
	return &CategoryService{repo: repo}
}

func (s *CategoryService) Create(ctx context.Context, name string) (*models.Category, error) {
	category := &models.Category{Name: name}
	if err := s.repo.Create(ctx, category); err != nil {
		return nil, apperrors.ErrInternal(err)
	}
	return category, nil
}

func (s *CategoryService) GetByID(ctx context.Context, id uuid.UUID) (*models.Category, error) {
	category, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, apperrors.ErrNotFound("category not found")
	}
	return category, nil
}

func (s *CategoryService) GetAll(ctx context.Context) ([]models.Category, error) {
	categories, err := s.repo.GetAll(ctx)
	if err != nil {
		return nil, apperrors.ErrInternal(err)
	}
	return categories, nil
}

func (s *CategoryService) Update(ctx context.Context, id uuid.UUID, name string) (*models.Category, error) {
	category, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, apperrors.ErrNotFound("category not found")
	}
	category.Name = name
	if err := s.repo.Update(ctx, category); err != nil {
		return nil, apperrors.ErrInternal(err)
	}
	return category, nil
}

func (s *CategoryService) Delete(ctx context.Context, id uuid.UUID) error {
	category, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return apperrors.ErrNotFound("category not found")
	}
	if err := s.repo.Delete(ctx, category.ID); err != nil {
		return apperrors.ErrInternal(err)
	}
	return nil
}
