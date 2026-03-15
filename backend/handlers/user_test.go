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

func setupRouter(h *handlers.UserHandler) *gin.Engine {
    gin.SetMode(gin.TestMode)
    r := gin.New()
    r.GET("/users/customers", h.GetAllCustomers)
    r.GET("/users/employees", h.GetAllEmployees)
    r.GET("/users/:id", h.GetByID)
    r.PUT("/users/:id", h.Update)
    r.DELETE("/users/:id", h.Delete)
    return r
}

// --- GetAllCustomers ---

func TestHandler_GetAllCustomers_Success(t *testing.T) {
    ctrl := gomock.NewController(t)
    mockSvc := mocks.NewMockUserServiceInterface(ctrl)
    h := handlers.NewUserHandler(mockSvc)
    r := setupRouter(h)

    expected := []models.User{{ID: uuid.New(), Username: "alice"}}
    mockSvc.EXPECT().GetAllCustomers(gomock.Any()).Return(expected, nil)

    w := httptest.NewRecorder()
    req := httptest.NewRequest(http.MethodGet, "/users/customers", nil)
    r.ServeHTTP(w, req)

    assert.Equal(t, http.StatusOK, w.Code)
}

func TestHandler_GetAllCustomers_Error(t *testing.T) {
    ctrl := gomock.NewController(t)
    mockSvc := mocks.NewMockUserServiceInterface(ctrl)
    h := handlers.NewUserHandler(mockSvc)
    r := setupRouter(h)

    mockSvc.EXPECT().
        GetAllCustomers(gomock.Any()).
        Return(nil, apperrors.ErrInternal(assert.AnError))

    w := httptest.NewRecorder()
    req := httptest.NewRequest(http.MethodGet, "/users/customers", nil)
    r.ServeHTTP(w, req)

    assert.Equal(t, http.StatusInternalServerError, w.Code)
}

// --- GetByID ---

func TestHandler_GetByID_Success(t *testing.T) {
    ctrl := gomock.NewController(t)
    mockSvc := mocks.NewMockUserServiceInterface(ctrl)
    h := handlers.NewUserHandler(mockSvc)
    r := setupRouter(h)

    id := uuid.New()
    expected := &models.User{ID: id, Username: "alice"}
    mockSvc.EXPECT().GetByID(gomock.Any(), id).Return(expected, nil)

    w := httptest.NewRecorder()
    req := httptest.NewRequest(http.MethodGet, "/users/"+id.String(), nil)
    r.ServeHTTP(w, req)

    assert.Equal(t, http.StatusOK, w.Code)

    var result models.User
	err := json.Unmarshal(w.Body.Bytes(), &result)
	assert.NoError(t, err)
    assert.Equal(t, id, result.ID)
}

func TestHandler_GetByID_InvalidUUID(t *testing.T) {
    ctrl := gomock.NewController(t)
    mockSvc := mocks.NewMockUserServiceInterface(ctrl)
    h := handlers.NewUserHandler(mockSvc)
    r := setupRouter(h)

    w := httptest.NewRecorder()
    req := httptest.NewRequest(http.MethodGet, "/users/not-a-uuid", nil)
    r.ServeHTTP(w, req)

    assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestHandler_GetByID_NotFound(t *testing.T) {
    ctrl := gomock.NewController(t)
    mockSvc := mocks.NewMockUserServiceInterface(ctrl)
    h := handlers.NewUserHandler(mockSvc)
    r := setupRouter(h)

    id := uuid.New()
    mockSvc.EXPECT().
        GetByID(gomock.Any(), id).
        Return(nil, apperrors.ErrNotFound("user not found"))

    w := httptest.NewRecorder()
    req := httptest.NewRequest(http.MethodGet, "/users/"+id.String(), nil)
    r.ServeHTTP(w, req)

    assert.Equal(t, http.StatusNotFound, w.Code)
}

// --- Update ---

func TestHandler_Update_Success(t *testing.T) {
    ctrl := gomock.NewController(t)
    mockSvc := mocks.NewMockUserServiceInterface(ctrl)
    h := handlers.NewUserHandler(mockSvc)
    r := setupRouter(h)

    id := uuid.New()
    body := dto.UpdateUserRequest{Username: "new", Email: "new@mail.com"}
    expected := &models.User{ID: id, Username: "new", Email: "new@mail.com"}

    mockSvc.EXPECT().Update(gomock.Any(), id, body).Return(expected, nil)

    b, _ := json.Marshal(body)
    w := httptest.NewRecorder()
    req := httptest.NewRequest(http.MethodPut, "/users/"+id.String(), bytes.NewBuffer(b))
    req.Header.Set("Content-Type", "application/json")
    r.ServeHTTP(w, req)

    assert.Equal(t, http.StatusOK, w.Code)
}

func TestHandler_Update_InvalidUUID(t *testing.T) {
    ctrl := gomock.NewController(t)
    mockSvc := mocks.NewMockUserServiceInterface(ctrl)
    h := handlers.NewUserHandler(mockSvc)
    r := setupRouter(h)

    w := httptest.NewRecorder()
    req := httptest.NewRequest(http.MethodPut, "/users/bad-id", bytes.NewBufferString(`{}`))
    req.Header.Set("Content-Type", "application/json")
    r.ServeHTTP(w, req)

    assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestHandler_Update_NotFound(t *testing.T) {
    ctrl := gomock.NewController(t)
    mockSvc := mocks.NewMockUserServiceInterface(ctrl)
    h := handlers.NewUserHandler(mockSvc)
    r := setupRouter(h)

    id := uuid.New()
    mockSvc.EXPECT().
        Update(gomock.Any(), id, gomock.Any()).
        Return(nil, apperrors.ErrNotFound("user not found"))

    b, _ := json.Marshal(dto.UpdateUserRequest{Username: "x", Email: "x@x.com"})
    w := httptest.NewRecorder()
    req := httptest.NewRequest(http.MethodPut, "/users/"+id.String(), bytes.NewBuffer(b))
    req.Header.Set("Content-Type", "application/json")
    r.ServeHTTP(w, req)

    assert.Equal(t, http.StatusNotFound, w.Code)
}

// --- Delete ---

func TestHandler_Delete_Success(t *testing.T) {
    ctrl := gomock.NewController(t)
    mockSvc := mocks.NewMockUserServiceInterface(ctrl)
    h := handlers.NewUserHandler(mockSvc)
    r := setupRouter(h)

    id := uuid.New()
    mockSvc.EXPECT().Delete(gomock.Any(), id).Return(nil)

    w := httptest.NewRecorder()
    req := httptest.NewRequest(http.MethodDelete, "/users/"+id.String(), nil)
    r.ServeHTTP(w, req)

    assert.Equal(t, http.StatusNoContent, w.Code)
}

func TestHandler_Delete_NotFound(t *testing.T) {
    ctrl := gomock.NewController(t)
    mockSvc := mocks.NewMockUserServiceInterface(ctrl)
    h := handlers.NewUserHandler(mockSvc)
    r := setupRouter(h)

    id := uuid.New()
    mockSvc.EXPECT().
        Delete(gomock.Any(), id).
        Return(apperrors.ErrNotFound("user not found"))

    w := httptest.NewRecorder()
    req := httptest.NewRequest(http.MethodDelete, "/users/"+id.String(), nil)
    r.ServeHTTP(w, req)

    assert.Equal(t, http.StatusNotFound, w.Code)
}

func TestHandler_Delete_InvalidUUID(t *testing.T) {
    ctrl := gomock.NewController(t)
    mockSvc := mocks.NewMockUserServiceInterface(ctrl)
    h := handlers.NewUserHandler(mockSvc)
    r := setupRouter(h)

    w := httptest.NewRecorder()
    req := httptest.NewRequest(http.MethodDelete, "/users/bad-id", nil)
    r.ServeHTTP(w, req)

    assert.Equal(t, http.StatusBadRequest, w.Code)
}