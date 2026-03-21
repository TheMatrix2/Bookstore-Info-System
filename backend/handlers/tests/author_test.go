package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/handlers"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/apperrors"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/dto"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/mocks"
	"github.com/gin-gonic/gin"
	"github.com/golang/mock/gomock"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func setupAuthorRouter(h *handlers.AuthorHandler) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.POST("/authors", h.Create)
	r.GET("/authors", h.GetAll)
	r.GET("/authors/:id", h.GetByID)
	r.PUT("/authors/:id", h.Update)
	r.DELETE("/authors/:id", h.Delete)
	return r
}

// --- Create ---

func TestAuthorHandler_Create_Success(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockAuthorServiceInterface(ctrl)
	h := handlers.NewAuthorHandler(mockSvc)
	r := setupAuthorRouter(h)

	input := dto.AuthorInput{Surname: "Толстой", Name: "Лев", Patronymic: "Николаевич"}
	expected := &models.Author{ID: uuid.New(), Surname: "Толстой", Name: "Лев", Patronymic: "Николаевич"}

	mockSvc.EXPECT().Create(gomock.Any(), input).Return(expected, nil)

	b, _ := json.Marshal(input)
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/authors", bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	var result models.Author
	err := json.Unmarshal(w.Body.Bytes(), &result)
	assert.NoError(t, err)
	assert.Equal(t, "Толстой", result.Surname)
}

func TestAuthorHandler_Create_InvalidBody(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockAuthorServiceInterface(ctrl)
	h := handlers.NewAuthorHandler(mockSvc)
	r := setupAuthorRouter(h)

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/authors", bytes.NewBufferString(`{invalid}`))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestAuthorHandler_Create_ServiceError(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockAuthorServiceInterface(ctrl)
	h := handlers.NewAuthorHandler(mockSvc)
	r := setupAuthorRouter(h)

	input := dto.AuthorInput{Surname: "Толстой", Name: "Лев", Patronymic: "Николаевич"}
	mockSvc.EXPECT().Create(gomock.Any(), input).Return(nil, apperrors.ErrInternal(assert.AnError))

	b, _ := json.Marshal(input)
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/authors", bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
}

// --- GetAll ---

func TestAuthorHandler_GetAll_Success(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockAuthorServiceInterface(ctrl)
	h := handlers.NewAuthorHandler(mockSvc)
	r := setupAuthorRouter(h)

	expected := []models.Author{
		{ID: uuid.New(), Surname: "Пушкин", Name: "Александр", Patronymic: "Сергеевич"},
		{ID: uuid.New(), Surname: "Толстой", Name: "Лев", Patronymic: "Николаевич"},
	}
	mockSvc.EXPECT().GetAll(gomock.Any()).Return(expected, nil)

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/authors", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var result []models.Author
	err := json.Unmarshal(w.Body.Bytes(), &result)
	assert.NoError(t, err)
	assert.Len(t, result, 2)
}

func TestAuthorHandler_GetAll_ServiceError(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockAuthorServiceInterface(ctrl)
	h := handlers.NewAuthorHandler(mockSvc)
	r := setupAuthorRouter(h)

	mockSvc.EXPECT().GetAll(gomock.Any()).Return(nil, apperrors.ErrInternal(assert.AnError))

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/authors", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
}

// --- GetByID ---

func TestAuthorHandler_GetByID_Success(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockAuthorServiceInterface(ctrl)
	h := handlers.NewAuthorHandler(mockSvc)
	r := setupAuthorRouter(h)

	id := uuid.New()
	expected := &models.Author{ID: id, Surname: "Пушкин", Name: "Александр", Patronymic: "Сергеевич"}

	mockSvc.EXPECT().GetByID(gomock.Any(), id).Return(expected, nil)

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/authors/"+id.String(), nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var result models.Author
	err := json.Unmarshal(w.Body.Bytes(), &result)
	assert.NoError(t, err)
	assert.Equal(t, id, result.ID)
}

func TestAuthorHandler_GetByID_InvalidUUID(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockAuthorServiceInterface(ctrl)
	h := handlers.NewAuthorHandler(mockSvc)
	r := setupAuthorRouter(h)

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/authors/not-a-uuid", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestAuthorHandler_GetByID_NotFound(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockAuthorServiceInterface(ctrl)
	h := handlers.NewAuthorHandler(mockSvc)
	r := setupAuthorRouter(h)

	id := uuid.New()
	mockSvc.EXPECT().GetByID(gomock.Any(), id).Return(nil, apperrors.ErrNotFound("author not found"))

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/authors/"+id.String(), nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
}

// --- Update ---

func TestAuthorHandler_Update_Success(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockAuthorServiceInterface(ctrl)
	h := handlers.NewAuthorHandler(mockSvc)
	r := setupAuthorRouter(h)

	id := uuid.New()
	input := dto.AuthorInput{Surname: "Новый", Name: "Автор", Patronymic: "Отчество"}
	expected := &models.Author{ID: id, Surname: "Новый", Name: "Автор", Patronymic: "Отчество"}

	mockSvc.EXPECT().Update(gomock.Any(), id, input).Return(expected, nil)

	b, _ := json.Marshal(input)
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPut, "/authors/"+id.String(), bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestAuthorHandler_Update_InvalidUUID(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockAuthorServiceInterface(ctrl)
	h := handlers.NewAuthorHandler(mockSvc)
	r := setupAuthorRouter(h)

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPut, "/authors/bad-id", bytes.NewBufferString(`{}`))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestAuthorHandler_Update_InvalidBody(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockAuthorServiceInterface(ctrl)
	h := handlers.NewAuthorHandler(mockSvc)
	r := setupAuthorRouter(h)

	id := uuid.New()
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPut, "/authors/"+id.String(), bytes.NewBufferString(`{invalid}`))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestAuthorHandler_Update_NotFound(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockAuthorServiceInterface(ctrl)
	h := handlers.NewAuthorHandler(mockSvc)
	r := setupAuthorRouter(h)

	id := uuid.New()
	input := dto.AuthorInput{Surname: "Новый", Name: "Автор", Patronymic: "Отчество"}

	mockSvc.EXPECT().Update(gomock.Any(), id, input).Return(nil, apperrors.ErrNotFound("author not found"))

	b, _ := json.Marshal(input)
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPut, "/authors/"+id.String(), bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
}

// --- Delete ---

func TestAuthorHandler_Delete_Success(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockAuthorServiceInterface(ctrl)
	h := handlers.NewAuthorHandler(mockSvc)
	r := setupAuthorRouter(h)

	id := uuid.New()
	mockSvc.EXPECT().Delete(gomock.Any(), id).Return(nil)

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodDelete, "/authors/"+id.String(), nil)
	r.ServeHTTP(w, req)

	// handler вызывает c.JSON(http.StatusNoContent, nil) — это 204
	assert.Equal(t, http.StatusNoContent, w.Code)
}

func TestAuthorHandler_Delete_InvalidUUID(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockAuthorServiceInterface(ctrl)
	h := handlers.NewAuthorHandler(mockSvc)
	r := setupAuthorRouter(h)

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodDelete, "/authors/bad-id", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestAuthorHandler_Delete_NotFound(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockAuthorServiceInterface(ctrl)
	h := handlers.NewAuthorHandler(mockSvc)
	r := setupAuthorRouter(h)

	id := uuid.New()
	mockSvc.EXPECT().Delete(gomock.Any(), id).Return(apperrors.ErrNotFound("author not found"))

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodDelete, "/authors/"+id.String(), nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
}

func TestAuthorHandler_Delete_ServiceError(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockAuthorServiceInterface(ctrl)
	h := handlers.NewAuthorHandler(mockSvc)
	r := setupAuthorRouter(h)

	id := uuid.New()
	mockSvc.EXPECT().Delete(gomock.Any(), id).Return(apperrors.ErrInternal(assert.AnError))

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodDelete, "/authors/"+id.String(), nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
}