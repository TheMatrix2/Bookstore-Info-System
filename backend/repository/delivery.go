package repository

import (
	"context"
	"fmt"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type DeliveryRepository struct {
	db *bun.DB
}

func NewDeliveryRepository(db *bun.DB) *DeliveryRepository {
	return &DeliveryRepository{db: db}
}

func (r *DeliveryRepository) Create(ctx context.Context, delivery *models.Delivery) error {
	_, err := r.db.NewInsert().Model(delivery).Exec(ctx)
	if err != nil {
		return fmt.Errorf("failed to create delivery: %w", err)
	}
	return nil
}

func (r *DeliveryRepository) GetByOrderID(ctx context.Context, orderID uuid.UUID) (*models.Delivery, error) {
	delivery := new(models.Delivery)
	err := r.db.NewSelect().Model(delivery).
		Where("\"delivery\".\"order_id\" = ?", orderID).
		Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("delivery not found: %w", err)
	}
	return delivery, nil
}

func (r *DeliveryRepository) UpdateStatus(ctx context.Context, orderID uuid.UUID, status string) error {
	_, err := r.db.NewUpdate().Model((*models.Delivery)(nil)).
		Set("status = ?", status).
		Set("updated_at = NOW()").
		Where("order_id = ?", orderID).
		Exec(ctx)
	if err != nil {
		return fmt.Errorf("failed to update delivery status: %w", err)
	}
	return nil
}
