package services

import (
	"context"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/apperrors"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/dto"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/interfaces"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"github.com/google/uuid"
)

type PublisherService struct {
	repo interfaces.PublisherRepositoryInterface
}

func NewPublisherService(repo interfaces.PublisherRepositoryInterface) *PublisherService {
	return &PublisherService{repo: repo}
}

func (s *PublisherService) Create(ctx context.Context, input dto.PublisherInput) (*models.Publisher, error) {
	publisher := &models.Publisher{
		Name: input.Name,
		Address: input.Address,
	}
	if err := s.repo.Create(ctx, publisher); err != nil {
		return nil, apperrors.ErrInternal(err)
	}
	return publisher, nil
}

func (s *PublisherService) GetByID(ctx context.Context, id uuid.UUID) (*models.Publisher, error) {
	publisher, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, apperrors.ErrNotFound("publisher not found")
	}
	return publisher, nil
}

func (s *PublisherService) GetAll(ctx context.Context) ([]models.Publisher, error) {
	publishers, err := s.repo.GetAll(ctx)
	if err != nil {
		return nil, apperrors.ErrInternal(err)
	}
	return publishers, nil
}

func (s *PublisherService) Update(ctx context.Context, id uuid.UUID, input dto.PublisherInput) (*models.Publisher, error) {
	publisher, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, apperrors.ErrNotFound("publisher not found")
	}

	publisher.Name = input.Name
	publisher.Address = input.Address

	if err := s.repo.Update(ctx, publisher); err != nil {
		return nil, apperrors.ErrInternal(err)
	}
	return publisher, nil
}

func (s *PublisherService) Delete(ctx context.Context, id uuid.UUID) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return apperrors.ErrInternal(err)
	}
	return nil
}