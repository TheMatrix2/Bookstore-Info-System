package repository

import (
	"context"
	"fmt"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type OrderRepository struct {
	db *bun.DB
}

func NewOrderRepository(db *bun.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

func (r *OrderRepository) Create(ctx context.Context, order *models.Order, items []*models.OrderItem) error {
	return r.db.RunInTx(ctx, nil, func(ctx context.Context, tx bun.Tx) error {
		if _, err := tx.NewInsert().Model(order).Exec(ctx); err != nil {
			return fmt.Errorf("failed to create order: %w", err)
		}
		if len(items) > 0 {
			for _, item := range items {
				item.OrderID = order.ID
			}
			if _, err := tx.NewInsert().Model(&items).Exec(ctx); err != nil {
				return fmt.Errorf("failed to create order items: %w", err)
			}
		}
		return nil
	})
}

func (r *OrderRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Order, error) {
	order := new(models.Order)
	err := r.db.NewSelect().Model(order).
		Relation("Items", func(q *bun.SelectQuery) *bun.SelectQuery {
			return q.Relation("Book", func(q *bun.SelectQuery) *bun.SelectQuery {
				return q.Relation("Authors")
			})
		}).
		Relation("Payment").
		Relation("Delivery").
		Where("\"order\".\"id\" = ?", id).
		Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("order not found: %w", err)
	}
	return order, nil
}

func (r *OrderRepository) GetByUserID(ctx context.Context, userID uuid.UUID) ([]models.Order, error) {
	var orders []models.Order
	err := r.db.NewSelect().Model(&orders).
		Relation("Items", func(q *bun.SelectQuery) *bun.SelectQuery {
			return q.Relation("Book")
		}).
		Relation("Payment").
		Relation("Delivery").
		Where("\"order\".\"user_id\" = ?", userID).
		OrderExpr("\"order\".\"created_at\" DESC").
		Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get user orders: %w", err)
	}
	return orders, nil
}

func (r *OrderRepository) GetAll(ctx context.Context) ([]models.Order, error) {
	var orders []models.Order
	err := r.db.NewSelect().Model(&orders).
		Relation("Items", func(q *bun.SelectQuery) *bun.SelectQuery {
			return q.Relation("Book")
		}).
		Relation("Payment").
		Relation("Delivery").
		Relation("User").
		OrderExpr("\"order\".\"created_at\" DESC").
		Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get all orders: %w", err)
	}
	return orders, nil
}

func (r *OrderRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status string) error {
	_, err := r.db.NewUpdate().Model((*models.Order)(nil)).
		Set("status = ?", status).
		Set("updated_at = NOW()").
		Where("id = ?", id).
		Exec(ctx)
	if err != nil {
		return fmt.Errorf("failed to update order status: %w", err)
	}
	return nil
}
