package handlers

import (
	"net/http"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/apperrors"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/dto"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/interfaces"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type UserHandler struct {
	userService interfaces.UserServiceInterface
}

func NewUserHandler(userService interfaces.UserServiceInterface) *UserHandler {
	return &UserHandler{userService: userService}
}

func (h *UserHandler) GetProfile(c *gin.Context) {
	raw, exists := c.Get("user_id")
	if !exists {
		apperrors.RespondeError(c, apperrors.ErrUnauthorized("missing user_id in token"))
		return
	}
	id, ok := raw.(uuid.UUID)
	if !ok {
		apperrors.RespondeError(c, apperrors.ErrUnauthorized("invalid user_id in token"))
		return
	}
	user, err := h.userService.GetByID(c.Request.Context(), id)
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) GetAllCustomers(c *gin.Context) {
	users, err := h.userService.GetAllCustomers(c.Request.Context())
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusOK, users)
}

func (h *UserHandler) GetAllEmployees(c *gin.Context) {
	users, err := h.userService.GetAllEmployees(c.Request.Context())
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusOK, users)
}

func (h *UserHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest("invalid user ID: " + err.Error()))
		return
	}
	user, err := h.userService.GetByID(c.Request.Context(), id)
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest("invalid user ID: " + err.Error()))
		return
	}

	var request dto.UpdateUserRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest(err.Error()))
		return
	}

	user, err := h.userService.Update(c.Request.Context(), id, request)
	if err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		apperrors.RespondeError(c, apperrors.ErrBadRequest("invalid user ID: " + err.Error()))
		return
	}

	if err := h.userService.Delete(c.Request.Context(), id); err != nil {
		apperrors.RespondeError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}