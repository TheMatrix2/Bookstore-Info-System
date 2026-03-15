package handlers

import (
	"net/http"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/apperrors"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/dto"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/interfaces"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService interfaces.AuthServiceInterface
}

func NewAuthHandler(authService interfaces.AuthServiceInterface) *AuthHandler {
	return &AuthHandler{authService: authService}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var request dto.RegisterRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest(err.Error()))
		return
	}

	resp, err := h.authService.Register(c.Request.Context(), request)
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}

	c.JSON(http.StatusCreated, resp)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var request dto.LoginRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest(err.Error()))
		return
	}

	resp, err := h.authService.Login(c.Request.Context(), request)
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}

	c.JSON(http.StatusOK, resp)
}