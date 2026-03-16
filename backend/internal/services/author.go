package services

import (
	"context"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/apperrors"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/dto"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/interfaces"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"github.com/google/uuid"
)

type AuthorService struct {
	repo interfaces.AuthorRepositoryInterface
}

func NewAuthorService(repo interfaces.AuthorRepositoryInterface) *AuthorService {
	return &AuthorService{repo: repo}
}

func (s *AuthorService) Create(ctx context.Context, input dto.AuthorInput) (*models.Author, error) {
	author := &models.Author{
		Surname:    input.Surname,
		Name:       input.Name,
		Patronymic: input.Patronymic,
		Info:       input.Info,
	}
	if err := s.repo.Create(ctx, author); err != nil {
		return nil, apperrors.ErrInternal(err)
	}
	return author, nil
}

func (s *AuthorService) GetByID(ctx context.Context, id uuid.UUID) (*models.Author, error) {
	author, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, apperrors.ErrNotFound("author not found")
	}
	return author, nil
}

func (s *AuthorService) GetAll(ctx context.Context) ([]models.Author, error) {
	authors, err := s.repo.GetAll(ctx)
	if err != nil {
		return nil, apperrors.ErrInternal(err)
	}
	return authors, nil
}

func (s *AuthorService) Update(ctx context.Context, id uuid.UUID, input dto.AuthorInput) (*models.Author, error) {
	author, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, apperrors.ErrNotFound("author not found")
	}

	author.Surname = input.Surname
	author.Name = input.Name
	author.Patronymic = input.Patronymic
	author.Info = input.Info

	if err := s.repo.Update(ctx, author); err != nil {
		return nil, apperrors.ErrInternal(err)
	}
	return author, nil
}

func (s *AuthorService) Delete(ctx context.Context, id uuid.UUID) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return apperrors.ErrInternal(err)
	}
	return nil
}