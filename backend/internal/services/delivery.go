package services

import (
	"context"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/apperrors"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/interfaces"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"github.com/google/uuid"
)

type DeliveryService struct {
	repo      interfaces.DeliveryRepositoryInterface
	orderRepo interfaces.OrderRepositoryInterface
}

func NewDeliveryService(repo interfaces.DeliveryRepositoryInterface, orderRepo interfaces.OrderRepositoryInterface) *DeliveryService {
	return &DeliveryService{repo: repo, orderRepo: orderRepo}
}

func (s *DeliveryService) Create(ctx context.Context, orderID uuid.UUID, address string) (*models.Delivery, error) {
	if _, err := s.orderRepo.GetByID(ctx, orderID); err != nil {
		if isNotFound(err) {
			return nil, apperrors.ErrNotFound("order not found")
		}
		return nil, apperrors.ErrInternal(err)
	}

	existing, err := s.repo.GetByOrderID(ctx, orderID)
	if err == nil && existing != nil {
		return nil, apperrors.ErrConflict("delivery already exists for this order")
	}

	delivery := &models.Delivery{
		OrderID: orderID,
		Address: address,
		Status:  "Waiting",
	}
	if err := s.repo.Create(ctx, delivery); err != nil {
		return nil, apperrors.ErrInternal(err)
	}
	return delivery, nil
}

func (s *DeliveryService) GetByOrderID(ctx context.Context, orderID uuid.UUID) (*models.Delivery, error) {
	delivery, err := s.repo.GetByOrderID(ctx, orderID)
	if err != nil {
		if isNotFound(err) {
			return nil, apperrors.ErrNotFound("delivery not found")
		}
		return nil, apperrors.ErrInternal(err)
	}
	return delivery, nil
}

func (s *DeliveryService) UpdateStatus(ctx context.Context, orderID uuid.UUID, status string) error {
	if err := s.repo.UpdateStatus(ctx, orderID, status); err != nil {
		return apperrors.ErrInternal(err)
	}
	return nil
}
