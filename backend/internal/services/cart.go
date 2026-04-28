package services

import (
	"context"
	"database/sql"
	"errors"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/apperrors"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/interfaces"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"github.com/google/uuid"
)

type CartService struct {
	repo interfaces.CartRepositoryInterface
}

func NewCartService(repo interfaces.CartRepositoryInterface) *CartService {
	return &CartService{repo: repo}
}

func isNotFound(err error) bool {
	return errors.Is(err, sql.ErrNoRows)
}

func (s *CartService) GetCart(ctx context.Context, userID uuid.UUID) (*models.Cart, error) {
	cart, err := s.repo.GetByUserID(ctx, userID)
	if err == nil {
		return cart, nil
	}
	if !isNotFound(err) {
		return nil, apperrors.ErrInternal(err)
	}

	cart = &models.Cart{UserID: userID}
	if err := s.repo.Create(ctx, cart); err != nil {
		return nil, apperrors.ErrInternal(err)
	}

	cart.Items = []*models.CartItem{}
	return cart, nil
}

func (s *CartService) AddItem(ctx context.Context, userID, bookID uuid.UUID, quantity int) (*models.Cart, error) {
	cart, err := s.GetCart(ctx, userID)
	if err != nil {
		return nil, err
	}

	item, err := s.repo.GetItem(ctx, cart.ID, bookID)
	if err != nil && !isNotFound(err) {
		return nil, apperrors.ErrInternal(err)
	}

	if item != nil {
		item.Quantity += quantity
		if err := s.repo.UpdateItem(ctx, item); err != nil {
			return nil, apperrors.ErrInternal(err)
		}
	} else {
		item = &models.CartItem{
			CartID:   cart.ID,
			BookID:   bookID,
			Quantity: quantity,
		}
		if err := s.repo.AddItem(ctx, item); err != nil {
			return nil, apperrors.ErrInternal(err)
		}
		cart.Items = append(cart.Items, item)
	}

	return cart, nil
}

func (s *CartService) UpdateItem(ctx context.Context, userID, bookID uuid.UUID, quantity int) (*models.Cart, error) {
	cart, err := s.repo.GetByUserID(ctx, userID)
	if err != nil {
		if isNotFound(err) {
			return nil, apperrors.ErrNotFound("cart not found")
		}
		return nil, apperrors.ErrInternal(err)
	}

	item, err := s.repo.GetItem(ctx, cart.ID, bookID)
	if err != nil {
		if isNotFound(err) {
			return nil, apperrors.ErrNotFound("item not found in cart")
		}
		return nil, apperrors.ErrInternal(err)
	}
	
	item.Quantity = quantity
	if err := s.repo.UpdateItem(ctx, item); err != nil {
		return nil, apperrors.ErrInternal(err)
	}

	return cart, nil
}

func (s *CartService) RemoveItem(ctx context.Context, userID uuid.UUID, bookID uuid.UUID) (*models.Cart, error) {
	cart, err := s.repo.GetByUserID(ctx, userID)
	if err != nil {
		if isNotFound(err) {
			return nil, apperrors.ErrNotFound("cart not found")
		}
		return nil, apperrors.ErrInternal(err)
	}

	_, err = s.repo.GetItem(ctx, cart.ID, bookID)
	if err != nil {
		if isNotFound(err) {
			return nil, apperrors.ErrNotFound("item not found in cart")
		}
		return nil, apperrors.ErrInternal(err)
	}

	if err := s.repo.RemoveItem(ctx, cart.ID, bookID); err != nil {
		return nil, apperrors.ErrInternal(err)
	}

	if cart, err := s.repo.GetByUserID(ctx, userID); err != nil {
		return nil, apperrors.ErrInternal(err)
	} else {
		return cart, nil
	}
}

func (s *CartService) ClearCart(ctx context.Context, userID uuid.UUID) error {
	cart, err := s.repo.GetByUserID(ctx, userID)
	if err != nil {
		if isNotFound(err) {
			return apperrors.ErrNotFound("cart not found")
		}
		return apperrors.ErrInternal(err)
	}

	if err := s.repo.ClearCart(ctx, cart.ID); err != nil {
		return apperrors.ErrInternal(err)
	}

	return nil
}