package interfaces

import (
	"context"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"github.com/google/uuid"
)

type CartRepositoryInterface interface {
	GetByUserID(ctx context.Context, userID uuid.UUID) (*models.Cart, error)
	Create(ctx context.Context, cart *models.Cart) error
	AddItem(ctx context.Context, item *models.CartItem) error
	UpdateItem(ctx context.Context, item *models.CartItem) error
	RemoveItem(ctx context.Context, cartID uuid.UUID, bookID uuid.UUID) error
	GetItem(ctx context.Context, cartID uuid.UUID, bookID uuid.UUID) (*models.CartItem, error)
	ClearCart(ctx context.Context, cartID uuid.UUID) error
}
 
type CartServiceInterface interface {
	GetCart(ctx context.Context, userID uuid.UUID) (*models.Cart, error)
	AddItem(ctx context.Context, userID uuid.UUID, bookID uuid.UUID, quantity int) (*models.Cart, error)
	UpdateItem(ctx context.Context, userID uuid.UUID, bookID uuid.UUID, quantity int) (*models.Cart, error)
	RemoveItem(ctx context.Context, userID uuid.UUID, bookID uuid.UUID) (*models.Cart, error)
	ClearCart(ctx context.Context, userID uuid.UUID) error
}