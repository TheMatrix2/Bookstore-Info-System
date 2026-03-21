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

func setupPublisherRouter(h *handlers.PublisherHandler) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.POST("/publishers", h.Create)
	r.GET("/publishers", h.GetAll)
	r.GET("/publishers/:id", h.GetByID)
	r.PUT("/publishers/:id", h.Update)
	r.DELETE("/publishers/:id", h.Delete)
	return r
}

// --- Create ---

func TestPublisherHandler_Create_Success(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockPublisherServiceInterface(ctrl)
	h := handlers.NewPublisherHandler(mockSvc)
	r := setupPublisherRouter(h)

	input := dto.PublisherInput{Name: "Эксмо", Address: "Москва, ул. Правды, 1"}
	expected := &models.Publisher{ID: uuid.New(), Name: "Эксмо", Address: "Москва, ул. Правды, 1"}

	mockSvc.EXPECT().Create(gomock.Any(), input).Return(expected, nil)

	b, _ := json.Marshal(input)
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/publishers", bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	var result models.Publisher
	err := json.Unmarshal(w.Body.Bytes(), &result)
	assert.NoError(t, err)
	assert.Equal(t, "Эксмо", result.Name)
}

func TestPublisherHandler_Create_InvalidBody(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockPublisherServiceInterface(ctrl)
	h := handlers.NewPublisherHandler(mockSvc)
	r := setupPublisherRouter(h)

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/publishers", bytes.NewBufferString(`{invalid}`))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestPublisherHandler_Create_ServiceError(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockPublisherServiceInterface(ctrl)
	h := handlers.NewPublisherHandler(mockSvc)
	r := setupPublisherRouter(h)

	input := dto.PublisherInput{Name: "Эксмо", Address: "Москва, ул. Правды, 1"}
	mockSvc.EXPECT().Create(gomock.Any(), input).Return(nil, apperrors.ErrInternal(assert.AnError))

	b, _ := json.Marshal(input)
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/publishers", bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
}

// --- GetAll ---

func TestPublisherHandler_GetAll_Success(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockPublisherServiceInterface(ctrl)
	h := handlers.NewPublisherHandler(mockSvc)
	r := setupPublisherRouter(h)

	expected := []models.Publisher{
		{ID: uuid.New(), Name: "Эксмо", Address: "Москва, ул. Правды, 1"},
		{ID: uuid.New(), Name: "АСТ", Address: "Москва, Садовническая, 10"},
	}
	mockSvc.EXPECT().GetAll(gomock.Any()).Return(expected, nil)

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/publishers", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var result []models.Publisher
	err := json.Unmarshal(w.Body.Bytes(), &result)
	assert.NoError(t, err)
	assert.Len(t, result, 2)
}

func TestPublisherHandler_GetAll_ServiceError(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockPublisherServiceInterface(ctrl)
	h := handlers.NewPublisherHandler(mockSvc)
	r := setupPublisherRouter(h)

	mockSvc.EXPECT().GetAll(gomock.Any()).Return(nil, apperrors.ErrInternal(assert.AnError))

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/publishers", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
}

// --- GetByID ---

func TestPublisherHandler_GetByID_Success(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockPublisherServiceInterface(ctrl)
	h := handlers.NewPublisherHandler(mockSvc)
	r := setupPublisherRouter(h)

	id := uuid.New()
	expected := &models.Publisher{ID: id, Name: "АСТ", Address: "Москва, Садовническая, 10"}

	mockSvc.EXPECT().GetByID(gomock.Any(), id).Return(expected, nil)

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/publishers/"+id.String(), nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var result models.Publisher
	err := json.Unmarshal(w.Body.Bytes(), &result)
	assert.NoError(t, err)
	assert.Equal(t, id, result.ID)
}

func TestPublisherHandler_GetByID_InvalidUUID(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockPublisherServiceInterface(ctrl)
	h := handlers.NewPublisherHandler(mockSvc)
	r := setupPublisherRouter(h)

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/publishers/not-a-uuid", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestPublisherHandler_GetByID_NotFound(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockPublisherServiceInterface(ctrl)
	h := handlers.NewPublisherHandler(mockSvc)
	r := setupPublisherRouter(h)

	id := uuid.New()
	mockSvc.EXPECT().GetByID(gomock.Any(), id).Return(nil, apperrors.ErrNotFound("publisher not found"))

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/publishers/"+id.String(), nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
}

// --- Update ---

func TestPublisherHandler_Update_Success(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockPublisherServiceInterface(ctrl)
	h := handlers.NewPublisherHandler(mockSvc)
	r := setupPublisherRouter(h)

	id := uuid.New()
	input := dto.PublisherInput{Name: "Новое", Address: "Новый адрес, ул. Свежая, 10"}
	expected := &models.Publisher{ID: id, Name: "Новое", Address: "Новый адрес, ул. Свежая, 10"}

	mockSvc.EXPECT().Update(gomock.Any(), id, input).Return(expected, nil)

	b, _ := json.Marshal(input)
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPut, "/publishers/"+id.String(), bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}

func TestPublisherHandler_Update_InvalidUUID(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockPublisherServiceInterface(ctrl)
	h := handlers.NewPublisherHandler(mockSvc)
	r := setupPublisherRouter(h)

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPut, "/publishers/bad-id", bytes.NewBufferString(`{}`))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestPublisherHandler_Update_InvalidBody(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockPublisherServiceInterface(ctrl)
	h := handlers.NewPublisherHandler(mockSvc)
	r := setupPublisherRouter(h)

	id := uuid.New()
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPut, "/publishers/"+id.String(), bytes.NewBufferString(`{invalid}`))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestPublisherHandler_Update_NotFound(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockPublisherServiceInterface(ctrl)
	h := handlers.NewPublisherHandler(mockSvc)
	r := setupPublisherRouter(h)

	id := uuid.New()
	input := dto.PublisherInput{Name: "Новое", Address: "Новый адрес, ул. Свежая, 10"}

	mockSvc.EXPECT().Update(gomock.Any(), id, input).Return(nil, apperrors.ErrNotFound("publisher not found"))

	b, _ := json.Marshal(input)
	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPut, "/publishers/"+id.String(), bytes.NewBuffer(b))
	req.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
}

// --- Delete ---

func TestPublisherHandler_Delete_Success(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockPublisherServiceInterface(ctrl)
	h := handlers.NewPublisherHandler(mockSvc)
	r := setupPublisherRouter(h)

	id := uuid.New()
	mockSvc.EXPECT().Delete(gomock.Any(), id).Return(nil)

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodDelete, "/publishers/"+id.String(), nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNoContent, w.Code)
}

func TestPublisherHandler_Delete_InvalidUUID(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockPublisherServiceInterface(ctrl)
	h := handlers.NewPublisherHandler(mockSvc)
	r := setupPublisherRouter(h)

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodDelete, "/publishers/bad-id", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestPublisherHandler_Delete_NotFound(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockPublisherServiceInterface(ctrl)
	h := handlers.NewPublisherHandler(mockSvc)
	r := setupPublisherRouter(h)

	id := uuid.New()
	mockSvc.EXPECT().Delete(gomock.Any(), id).Return(apperrors.ErrNotFound("publisher not found"))

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodDelete, "/publishers/"+id.String(), nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)
}

func TestPublisherHandler_Delete_ServiceError(t *testing.T) {
	ctrl := gomock.NewController(t)
	mockSvc := mocks.NewMockPublisherServiceInterface(ctrl)
	h := handlers.NewPublisherHandler(mockSvc)
	r := setupPublisherRouter(h)

	id := uuid.New()
	mockSvc.EXPECT().Delete(gomock.Any(), id).Return(apperrors.ErrInternal(assert.AnError))

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodDelete, "/publishers/"+id.String(), nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusInternalServerError, w.Code)
}