package interfaces

import (
	"context"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"github.com/google/uuid"
)

type OrderRepositoryInterface interface {
	Create(ctx context.Context, order *models.Order, items []*models.OrderItem) error
	GetByID(ctx context.Context, id uuid.UUID) (*models.Order, error)
	GetByUserID(ctx context.Context, userID uuid.UUID) ([]models.Order, error)
	GetAll(ctx context.Context) ([]models.Order, error)
	UpdateStatus(ctx context.Context, id uuid.UUID, status string) error
}

type OrderServiceInterface interface {
	CreateFromCart(ctx context.Context, userID uuid.UUID) (*models.Order, error)
	GetByID(ctx context.Context, id uuid.UUID, userID uuid.UUID) (*models.Order, error)
	GetUserOrders(ctx context.Context, userID uuid.UUID) ([]models.Order, error)
	GetAll(ctx context.Context) ([]models.Order, error)
	UpdateStatus(ctx context.Context, id uuid.UUID, status string) error
}

type PaymentRepositoryInterface interface {
	Create(ctx context.Context, payment *models.Payment) error
	GetByOrderID(ctx context.Context, orderID uuid.UUID) (*models.Payment, error)
	UpdateStatus(ctx context.Context, id uuid.UUID, status string) error
}

type PaymentServiceInterface interface {
	Create(ctx context.Context, orderID uuid.UUID, method string) (*models.Payment, error)
	GetByOrderID(ctx context.Context, orderID uuid.UUID) (*models.Payment, error)
	UpdateStatus(ctx context.Context, id uuid.UUID, status string) error
}

type DeliveryRepositoryInterface interface {
	Create(ctx context.Context, delivery *models.Delivery) error
	GetByOrderID(ctx context.Context, orderID uuid.UUID) (*models.Delivery, error)
	UpdateStatus(ctx context.Context, orderID uuid.UUID, status string) error
}

type DeliveryServiceInterface interface {
	Create(ctx context.Context, orderID uuid.UUID, address string) (*models.Delivery, error)
	GetByOrderID(ctx context.Context, orderID uuid.UUID) (*models.Delivery, error)
	UpdateStatus(ctx context.Context, orderID uuid.UUID, status string) error
}
