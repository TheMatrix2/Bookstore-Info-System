package repository

import (
	"context"
	"fmt"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type PaymentRepository struct {
	db *bun.DB
}

func NewPaymentRepository(db *bun.DB) *PaymentRepository {
	return &PaymentRepository{db: db}
}

func (r *PaymentRepository) Create(ctx context.Context, payment *models.Payment) error {
	_, err := r.db.NewInsert().Model(payment).Exec(ctx)
	if err != nil {
		return fmt.Errorf("failed to create payment: %w", err)
	}
	return nil
}

func (r *PaymentRepository) GetByOrderID(ctx context.Context, orderID uuid.UUID) (*models.Payment, error) {
	payment := new(models.Payment)
	err := r.db.NewSelect().Model(payment).
		Where("\"payment\".\"order_id\" = ?", orderID).
		Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("payment not found: %w", err)
	}
	return payment, nil
}

func (r *PaymentRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status string) error {
	_, err := r.db.NewUpdate().Model((*models.Payment)(nil)).
		Set("status = ?", status).
		Set("updated_at = NOW()").
		Where("id = ?", id).
		Exec(ctx)
	if err != nil {
		return fmt.Errorf("failed to update payment status: %w", err)
	}
	return nil
}
