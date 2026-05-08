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

type PaymentHandler struct {
	service interfaces.PaymentServiceInterface
}

func NewPaymentHandler(service interfaces.PaymentServiceInterface) *PaymentHandler {
	return &PaymentHandler{service: service}
}

// POST /orders/:id/payment
func (h *PaymentHandler) Create(c *gin.Context) {
	_, ok := parsers.UserIDFromContext(c)
	if !ok {
		return
	}
	orderID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest("invalid id"))
		return
	}
	var input dto.CreatePaymentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest(err.Error()))
		return
	}
	payment, err := h.service.Create(c.Request.Context(), orderID, input.Method)
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusCreated, payment)
}

// GET /orders/:id/payment
func (h *PaymentHandler) GetByOrderID(c *gin.Context) {
	_, ok := parsers.UserIDFromContext(c)
	if !ok {
		return
	}
	orderID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest("invalid id"))
		return
	}
	payment, err := h.service.GetByOrderID(c.Request.Context(), orderID)
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusOK, payment)
}

// PUT /admin/payments/:id/status
func (h *PaymentHandler) UpdateStatus(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest("invalid payment ID"))
		return
	}
	var input dto.UpdatePaymentStatusInput
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
