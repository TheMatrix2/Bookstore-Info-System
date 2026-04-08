package handlers

import (
	"net/http"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/apperrors"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/dto"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/interfaces"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type BookHandler struct {
	service interfaces.BookServiceInterface
}

func NewBookHandler(service interfaces.BookServiceInterface) *BookHandler {
	return &BookHandler{service: service}
}

func (h *BookHandler) Create(c *gin.Context) {
	var input dto.BookInput
	if err := c.ShouldBindJSON(&input); err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest(err.Error()))
		return
	}
	book, err := h.service.Create(c.Request.Context(), input)
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusCreated, book)
}

func (h *BookHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest("invalid book ID"))
		return
	}
	book, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusOK, book)
}

func (h *BookHandler) GetAll(c *gin.Context) {
	var filter dto.BookFilter
	if err := c.ShouldBindQuery(&filter); err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest(err.Error()))
		return
	}
	books, err := h.service.GetAll(c.Request.Context(), filter)
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusOK, books)
}

func (h *BookHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest("invalid book ID"))
		return
	}
	var input dto.BookInput
	if err := c.ShouldBindJSON(&input); err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest(err.Error()))
		return
	}
	book, err := h.service.Update(c.Request.Context(), id, input)
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusOK, book)
}

func (h *BookHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest("invalid book ID"))
		return
	}
	if err := h.service.Delete(c.Request.Context(), id); err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}