package services

import (
	"context"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/apperrors"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/interfaces"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"github.com/google/uuid"
)

type OrderService struct {
	orderRepo interfaces.OrderRepositoryInterface
	cartRepo  interfaces.CartRepositoryInterface
}

func NewOrderService(orderRepo interfaces.OrderRepositoryInterface, cartRepo interfaces.CartRepositoryInterface) *OrderService {
	return &OrderService{orderRepo: orderRepo, cartRepo: cartRepo}
}

func (s *OrderService) CreateFromCart(ctx context.Context, userID uuid.UUID) (*models.Order, error) {
	cart, err := s.cartRepo.GetByUserID(ctx, userID)
	if err != nil {
		if isNotFound(err) {
			return nil, apperrors.ErrBadRequest("cart is empty")
		}
		return nil, apperrors.ErrInternal(err)
	}
	if len(cart.Items) == 0 {
		return nil, apperrors.ErrBadRequest("cart is empty")
	}

	var total float64
	orderItems := make([]*models.OrderItem, 0, len(cart.Items))
	for _, item := range cart.Items {
		price := 0.0
		if item.Book != nil {
			price = item.Book.Price
		}
		total += price * float64(item.Quantity)
		orderItems = append(orderItems, &models.OrderItem{
			BookID:   item.BookID,
			Quantity: item.Quantity,
			Price:    price,
		})
	}

	order := &models.Order{
		UserID:     userID,
		TotalPrice: total,
		Status:     "New",
	}

	if err := s.orderRepo.Create(ctx, order, orderItems); err != nil {
		return nil, apperrors.ErrInternal(err)
	}

	if err := s.cartRepo.ClearCart(ctx, cart.ID); err != nil {
		return nil, apperrors.ErrInternal(err)
	}

	return s.orderRepo.GetByID(ctx, order.ID)
}

func (s *OrderService) GetByID(ctx context.Context, id uuid.UUID, userID uuid.UUID) (*models.Order, error) {
	order, err := s.orderRepo.GetByID(ctx, id)
	if err != nil {
		if isNotFound(err) {
			return nil, apperrors.ErrNotFound("order not found")
		}
		return nil, apperrors.ErrInternal(err)
	}
	if order.UserID != userID {
		return nil, apperrors.ErrNotFound("order not found")
	}
	return order, nil
}

func (s *OrderService) GetUserOrders(ctx context.Context, userID uuid.UUID) ([]models.Order, error) {
	orders, err := s.orderRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, apperrors.ErrInternal(err)
	}
	return orders, nil
}

func (s *OrderService) GetAll(ctx context.Context) ([]models.Order, error) {
	orders, err := s.orderRepo.GetAll(ctx)
	if err != nil {
		return nil, apperrors.ErrInternal(err)
	}
	return orders, nil
}

func (s *OrderService) UpdateStatus(ctx context.Context, id uuid.UUID, status string) error {
	if _, err := s.orderRepo.GetByID(ctx, id); err != nil {
		return apperrors.ErrNotFound("order not found")
	}
	if err := s.orderRepo.UpdateStatus(ctx, id, status); err != nil {
		return apperrors.ErrInternal(err)
	}
	return nil
}
