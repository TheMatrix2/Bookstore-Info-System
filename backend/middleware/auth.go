package middleware

import (
	"net/http"
	"strings"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/services"
	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	return func (c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header == "" || !strings.HasPrefix(header, "Bearer ") {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(header, "Bearer ")
		claims, err := services.ValidateToken(tokenString)
		if err != nil {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("role", claims.Role)
		c.Next()
	}
}