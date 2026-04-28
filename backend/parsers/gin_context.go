package parsers

import (
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/apperrors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func UserIDFromContext(c *gin.Context) (uuid.UUID, bool) {
	raw, exists := c.Get("user_id")
	if !exists {
		apperrors.RespondeError(c, apperrors.ErrUnauthorized("missing user_id in token"))
		return uuid.UUID{}, false
	}
	id, ok := raw.(uuid.UUID)
	if !ok {
		apperrors.RespondeError(c, apperrors.ErrUnauthorized("invalid user_id in token"))
		return uuid.UUID{}, false
	}
	return id, true
}