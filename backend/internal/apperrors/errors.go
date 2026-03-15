package apperrors

import (
	"errors"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AppError struct {
	Code	int
	Message string
	Err 	error
}

func (e *AppError) Error() string {
	return e.Message
}

func ErrBadRequest(msg string) *AppError {
	return &AppError{Code: http.StatusBadRequest, Message: msg}
}

func ErrConflict(msg string) *AppError {
	return &AppError{Code: http.StatusConflict, Message: msg}
}

func ErrUnauthorized(msg string) *AppError {
	return &AppError{Code: http.StatusUnauthorized, Message: msg}
}

func ErrNotFound(msg string) *AppError {
	return &AppError{Code: http.StatusNotFound, Message: msg}
}

func ErrInternal(err error) *AppError {
	return &AppError{Code: http.StatusInternalServerError, Message: "internal server error", Err: err}
}

func RespondeError(c *gin.Context, err error) {
	var appErr *AppError
	if errors.As(err, &appErr) {
		if appErr.Err != nil {
			log.Printf("internal error: %v", appErr.Err)
		}
		c.JSON(appErr.Code, gin.H{"error": appErr.Message})
		return
	}
	log.Printf("unexpected error: %v", err)
	c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
}