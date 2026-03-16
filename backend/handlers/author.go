package handlers

import (
	"net/http"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/apperrors"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/dto"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/interfaces"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AuthorHandler struct {
	authorService interfaces.AuthorServiceInterface
}

func NewAuthorHandler(authorService interfaces.AuthorServiceInterface) *AuthorHandler {
	return &AuthorHandler{authorService: authorService}
}

func (h *AuthorHandler) Create(c *gin.Context) {
	var input dto.AuthorInput
	if err := c.ShouldBindJSON(&input); err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest(err.Error()))
		return
	}
	author, err := h.authorService.Create(c.Request.Context(), input)
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusCreated, author)
}

func (h *AuthorHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest("invalid author ID: " + err.Error()))
		return
	}
	author, err := h.authorService.GetByID(c.Request.Context(), id)
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusOK, author)
}

func (h *AuthorHandler) GetAll(c *gin.Context) {
	authors, err := h.authorService.GetAll(c.Request.Context())
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusOK, authors)
}

func (h *AuthorHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest("invalid author ID: " + err.Error()))
		return
	}
	var input dto.AuthorInput
	if err := c.ShouldBindJSON(&input); err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest(err.Error()))
		return
	}
	author, err := h.authorService.Update(c.Request.Context(), id, input)
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusOK, author)
}

func (h *AuthorHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest("invalid author ID: " + err.Error()))
		return
	}
	err = h.authorService.Delete(c.Request.Context(), id)
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusNoContent, nil)
}