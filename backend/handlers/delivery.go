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

type DeliveryHandler struct {
	service interfaces.DeliveryServiceInterface
}

func NewDeliveryHandler(service interfaces.DeliveryServiceInterface) *DeliveryHandler {
	return &DeliveryHandler{service: service}
}

// POST /orders/:id/delivery
func (h *DeliveryHandler) Create(c *gin.Context) {
	_, ok := parsers.UserIDFromContext(c)
	if !ok {
		return
	}
	orderID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest("invalid id"))
		return
	}
	var input dto.CreateDeliveryInput
	if err := c.ShouldBindJSON(&input); err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest(err.Error()))
		return
	}
	delivery, err := h.service.Create(c.Request.Context(), orderID, input.Address)
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusCreated, delivery)
}

// GET /orders/:id/delivery
func (h *DeliveryHandler) GetByOrderID(c *gin.Context) {
	_, ok := parsers.UserIDFromContext(c)
	if !ok {
		return
	}
	orderID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest("invalid id"))
		return
	}
	delivery, err := h.service.GetByOrderID(c.Request.Context(), orderID)
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusOK, delivery)
}

// PUT /admin/deliveries/:id/status
func (h *DeliveryHandler) UpdateStatus(c *gin.Context) {
	orderID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest("invalid id"))
		return
	}
	var input dto.UpdateDeliveryStatusInput
	if err := c.ShouldBindJSON(&input); err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest(err.Error()))
		return
	}
	if err := h.service.UpdateStatus(c.Request.Context(), orderID, input.Status); err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}
