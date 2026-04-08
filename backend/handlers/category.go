package handlers

import (
    "net/http"

    "github.com/TheMatrix2/Bookstore-Info-System/backend/internal/apperrors"
    "github.com/TheMatrix2/Bookstore-Info-System/backend/internal/interfaces"
    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
)

type CategoryHandler struct {
    service interfaces.CategoryServiceInterface
}

func NewCategoryHandler(service interfaces.CategoryServiceInterface) *CategoryHandler {
    return &CategoryHandler{service: service}
}

func (h *CategoryHandler) Create(c *gin.Context) {
    var name string
    if err := c.ShouldBindJSON(&name); err != nil {
        apperrors.RespondeError(c, apperrors.ErrBadRequest(err.Error()))
        return
    }
    category, err := h.service.Create(c.Request.Context(), name)
    if err != nil {
        apperrors.RespondeError(c, err)
        return
    }
    c.JSON(http.StatusCreated, category)
}

func (h *CategoryHandler) GetAll(c *gin.Context) {
    categories, err := h.service.GetAll(c.Request.Context())
    if err != nil {
        apperrors.RespondeError(c, err)
        return
    }
    c.JSON(http.StatusOK, categories)
}

func (h *CategoryHandler) GetByID(c *gin.Context) {
    id, err := uuid.Parse(c.Param("id"))
    if err != nil {
        apperrors.RespondeError(c, apperrors.ErrBadRequest("invalid category ID"))
        return
    }
    category, err := h.service.GetByID(c.Request.Context(), id)
    if err != nil {
        apperrors.RespondeError(c, err)
        return
    }
    c.JSON(http.StatusOK, category)
}

func (h *CategoryHandler) Update(c *gin.Context) {
    id, err := uuid.Parse(c.Param("id"))
    if err != nil {
        apperrors.RespondeError(c, apperrors.ErrBadRequest("invalid category ID"))
        return
    }
    var name string
	if err := c.ShouldBindJSON(&name); err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest(err.Error()))
		return
	}
    category, err := h.service.Update(c.Request.Context(), id, name)
    if err != nil {
        apperrors.RespondeError(c, err)
        return
    }
    c.JSON(http.StatusOK, category)
}

func (h *CategoryHandler) Delete(c *gin.Context) {
    id, err := uuid.Parse(c.Param("id"))
    if err != nil {
        apperrors.RespondeError(c, apperrors.ErrBadRequest("invalid category ID"))
        return
    }
    if err := h.service.Delete(c.Request.Context(), id); err != nil {
        apperrors.RespondeError(c, err)
        return
    }
    c.Status(http.StatusNoContent)
}