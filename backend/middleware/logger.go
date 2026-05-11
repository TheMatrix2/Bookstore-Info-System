package middleware

import (
	"log/slog"
	"time"

	"github.com/gin-gonic/gin"
)

func Logger(log *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()

		status := c.Writer.Status()
		attrs := []any{
			slog.String("method", c.Request.Method),
			slog.String("path", c.FullPath()),
			slog.Int("status", status),
			slog.Duration("duration", time.Since(start)),
			slog.String("ip", c.ClientIP()),
		}
		
		if userID, exists := c.Get("user_id"); exists {
			attrs = append(attrs, slog.Any("user_id", userID))
		}

		switch {
		case status >= 500:
			log.Error("server error", attrs...)
		case status >= 400:
			log.Warn("client error", attrs...)
		case status >= 300:
			log.Info("redirection", attrs...)
		default:
			log.Info("request completed", attrs...)
		}
	}
}