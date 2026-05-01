package repository

import (
	"context"
	"fmt"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)
 
type CartRepository struct {
	db *bun.DB
}

func NewCartRepository(db *bun.DB) *CartRepository {
	return &CartRepository{db: db}
}

func (r *CartRepository) Create(ctx context.Context, cart *models.Cart) error {
	_, err := r.db.NewInsert().
		Model(cart).
		Exec(ctx)
	if err != nil {
		return fmt.Errorf("failed to create cart: %W", err)
	}
	return nil
}

func (r *CartRepository) GetByUserID(ctx context.Context, userID uuid.UUID) (*models.Cart, error) {
	cart := new(models.Cart)
	err := r.db.NewSelect().
		Model(cart).
		Relation("Items", func(q *bun.SelectQuery) *bun.SelectQuery {
			return q.Relation("Book")
		}).
		Where("\"cart\".\"user_id\" = ?", userID).
		Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to found cart: %w", err)
	}
	return cart, nil
}

func (r *CartRepository) GetItem(ctx context.Context, cartID, bookID uuid.UUID) (*models.CartItem, error) {
	item := new(models.CartItem)
	err := r.db.NewSelect().
		Model(item).
		Where("\"cart_item\".\"cart_id\" = ? AND \"cart_item\".\"book_id\" = ?", cartID, bookID).
		Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to found cart item: %w", err)
	}
	return item, nil
}

func (r *CartRepository) AddItem(ctx context.Context, item *models.CartItem) error {
	_, err := r.db.NewInsert().
		Model(item).
		Exec(ctx)
	if err != nil {
		return fmt.Errorf("failed to add item to cart: %w", err)
	}
	return nil
}

func (r *CartRepository) UpdateItem(ctx context.Context, item *models.CartItem) error {
	_, err := r.db.NewUpdate().
		Model(item).
		Where("\"cart_item\".\"id\" = ?", item.ID).
		Exec(ctx)
	if err != nil {
		return fmt.Errorf("failed to update cart item: %w", err)
	}
	return nil
}

func (r *CartRepository) RemoveItem(ctx context.Context, cartID uuid.UUID, bookID uuid.UUID) error {
	_, err := r.db.NewDelete().
		Model((*models.CartItem)(nil)).
		Where("\"cart_item\".\"cart_id\" = ? AND \"cart_item\".\"book_id\" = ?", cartID, bookID).
		Exec(ctx)
	if err != nil {
		return fmt.Errorf("failed to remove cart item: %w", err)
	}
	return nil
}

func (r *CartRepository) ClearCart(ctx context.Context, cartID uuid.UUID) error {
	_, err := r.db.NewDelete().
		Model((*models.CartItem)(nil)).
		Where("\"cart_item\".\"cart_id\" = ?", cartID).
		Exec(ctx)
	if err != nil {
		return fmt.Errorf("failed to clear cart: %w", err)
	}
	return nil
}