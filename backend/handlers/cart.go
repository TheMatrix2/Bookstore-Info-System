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

type CartHandler struct {
	service interfaces.CartServiceInterface
}

func NewCartHandler(service interfaces.CartServiceInterface) *CartHandler {
	return &CartHandler{service: service}
}

// GET /cart
func (h *CartHandler) GetCart(c *gin.Context) {
	userID, ok := parsers.UserIDFromContext(c)
	if !ok {
		return
	}
 
	cart, err := h.service.GetCart(c.Request.Context(), userID)
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusOK, cart)
}
 
// POST /cart/items
func (h *CartHandler) AddItem(c *gin.Context) {
	userID, ok := parsers.UserIDFromContext(c)
	if !ok {
		return
	}
 
	var input dto.CartItemCreateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest(err.Error()))
		return
	}
 
	bookID, err := uuid.Parse(input.BookID)
	if err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest("invalid book_id: "+err.Error()))
		return
	}
 
	cart, err := h.service.AddItem(c.Request.Context(), userID, bookID, input.Quantity)
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusOK, cart)
}
 
// PUT /cart/items/:book_id
func (h *CartHandler) UpdateItem(c *gin.Context) {
	userID, ok := parsers.UserIDFromContext(c)
	if !ok {
		return
	}
 
	bookID, err := uuid.Parse(c.Param("book_id"))
	if err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest("invalid book_id: "+err.Error()))
		return
	}
 
	var input dto.CartItemUpdateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest(err.Error()))
		return
	}
 
	cart, err := h.service.UpdateItem(c.Request.Context(), userID, bookID, input.Quantity)
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusOK, cart)
}
 
// DELETE /cart/items/:book_id
func (h *CartHandler) RemoveItem(c *gin.Context) {
	userID, ok := parsers.UserIDFromContext(c)
	if !ok {
		return
	}
 
	bookID, err := uuid.Parse(c.Param("book_id"))
	if err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest("invalid book_id: "+err.Error()))
		return
	}
 
	cart, err := h.service.RemoveItem(c.Request.Context(), userID, bookID)
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusOK, cart)
}
 
// DELETE /cart
func (h *CartHandler) ClearCart(c *gin.Context) {
	userID, ok := parsers.UserIDFromContext(c)
	if !ok {
		return
	}
 
	if err := h.service.ClearCart(c.Request.Context(), userID); err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}