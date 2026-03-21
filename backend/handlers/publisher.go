package handlers

import (
	"net/http"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/apperrors"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/dto"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/interfaces"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PublisherHandler struct {
	publisherService interfaces.PublisherServiceInterface
}

func NewPublisherHandler(publisherService interfaces.PublisherServiceInterface) *PublisherHandler {
	return &PublisherHandler{publisherService: publisherService}
}

func (h *PublisherHandler) Create(c *gin.Context) {
	var input dto.PublisherInput
	if err := c.ShouldBindJSON(&input); err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest(err.Error()))
		return
	}
	publisher, err := h.publisherService.Create(c.Request.Context(), input)
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusCreated, publisher)
}

func (h *PublisherHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest("invalid publisher ID: " + err.Error()))
		return
	}
	publisher, err := h.publisherService.GetByID(c.Request.Context(), id)
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusOK, publisher)
}

func (h *PublisherHandler) GetAll(c *gin.Context) {
	publishers, err := h.publisherService.GetAll(c.Request.Context())
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusOK, publishers)
}

func (h *PublisherHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest("invalid publisher ID: " + err.Error()))
		return
	}
	var input dto.PublisherInput
	if err := c.ShouldBindJSON(&input); err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest(err.Error()))
		return
	}
	publisher, err := h.publisherService.Update(c.Request.Context(), id, input)
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusOK, publisher)
}

func (h *PublisherHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest("invalid publisher ID: " + err.Error()))
		return
	}
	err = h.publisherService.Delete(c.Request.Context(), id)
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusNoContent, nil)
}