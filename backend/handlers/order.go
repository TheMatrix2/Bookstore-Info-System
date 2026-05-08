package handlers

import (
	"net/http"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/apperrors"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/dto"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/interfaces"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/parsers"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type OrderHandler struct {
	service interfaces.OrderServiceInterface
}

func NewOrderHandler(service interfaces.OrderServiceInterface) *OrderHandler {
	return &OrderHandler{service: service}
}

// POST /orders — create order from cart
func (h *OrderHandler) Create(c *gin.Context) {
	userID, ok := parsers.UserIDFromContext(c)
	if !ok {
		return
	}
	order, err := h.service.CreateFromCart(c.Request.Context(), userID)
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusCreated, order)
}

// GET /orders — user's own orders
func (h *OrderHandler) GetUserOrders(c *gin.Context) {
	userID, ok := parsers.UserIDFromContext(c)
	if !ok {
		return
	}
	orders, err := h.service.GetUserOrders(c.Request.Context(), userID)
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusOK, orders)
}

// GET /orders/:id
func (h *OrderHandler) GetByID(c *gin.Context) {
	userID, ok := parsers.UserIDFromContext(c)
	if !ok {
		return
	}
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest("invalid order ID"))
		return
	}
	order, err := h.service.GetByID(c.Request.Context(), id, userID)
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusOK, order)
}

// GET /admin/orders — all orders (employee)
func (h *OrderHandler) GetAll(c *gin.Context) {
	orders, err := h.service.GetAll(c.Request.Context())
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusOK, orders)
}

// PUT /admin/orders/:id/status — update order status (employee)
func (h *OrderHandler) UpdateStatus(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest("invalid order ID"))
		return
	}
	var input dto.UpdateOrderStatusInput
	if err := c.ShouldBindJSON(&input); err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest(err.Error()))
		return
	}
	if err := h.service.UpdateStatus(c.Request.Context(), id, input.Status); err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}
