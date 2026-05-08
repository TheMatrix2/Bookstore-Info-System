package services

import (
	"context"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/apperrors"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/interfaces"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"github.com/google/uuid"
)

type PaymentService struct {
	repo      interfaces.PaymentRepositoryInterface
	orderRepo interfaces.OrderRepositoryInterface
}

func NewPaymentService(repo interfaces.PaymentRepositoryInterface, orderRepo interfaces.OrderRepositoryInterface) *PaymentService {
	return &PaymentService{repo: repo, orderRepo: orderRepo}
}

func (s *PaymentService) Create(ctx context.Context, orderID uuid.UUID, method string) (*models.Payment, error) {
	order, err := s.orderRepo.GetByID(ctx, orderID)
	if err != nil {
		if isNotFound(err) {
			return nil, apperrors.ErrNotFound("order not found")
		}
		return nil, apperrors.ErrInternal(err)
	}

	existing, err := s.repo.GetByOrderID(ctx, orderID)
	if err == nil && existing != nil {
		return nil, apperrors.ErrConflict("payment already exists for this order")
	}

	payment := &models.Payment{
		OrderID: orderID,
		Amount:  order.TotalPrice,
		Method:  method,
		Status:  "Not paid",
	}
	if err := s.repo.Create(ctx, payment); err != nil {
		return nil, apperrors.ErrInternal(err)
	}
	return payment, nil
}

func (s *PaymentService) GetByOrderID(ctx context.Context, orderID uuid.UUID) (*models.Payment, error) {
	payment, err := s.repo.GetByOrderID(ctx, orderID)
	if err != nil {
		if isNotFound(err) {
			return nil, apperrors.ErrNotFound("payment not found")
		}
		return nil, apperrors.ErrInternal(err)
	}
	return payment, nil
}

func (s *PaymentService) UpdateStatus(ctx context.Context, id uuid.UUID, status string) error {
	if err := s.repo.UpdateStatus(ctx, id, status); err != nil {
		return apperrors.ErrInternal(err)
	}
	return nil
}
