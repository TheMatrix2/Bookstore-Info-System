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
	"github.com/TheMatrix2/Bookstore-Info-System/backend/mocks"
	"github.com/gin-gonic/gin"
	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
)

func setupAuthRouter(h *handlers.AuthHandler) *gin.Engine {
    gin.SetMode(gin.TestMode)
    r := gin.New()
    r.POST("/auth/register", h.Register)
    r.POST("/auth/login", h.Login)
    return r
}

// --- Register ---

func TestAuthHandler_Register_Success(t *testing.T) {
    ctrl := gomock.NewController(t)
    mockSvc := mocks.NewMockAuthServiceInterface(ctrl)
    h := handlers.NewAuthHandler(mockSvc)
    r := setupAuthRouter(h)

    req := dto.RegisterRequest{
        Username: "alice",
        Email:    "alice@mail.com",
        Password: "password123",
    }
    mockSvc.EXPECT().
        Register(gomock.Any(), req).
        Return(&dto.AuthResponse{Token: "token123"}, nil)

    b, _ := json.Marshal(req)
    w := httptest.NewRecorder()
    httpReq := httptest.NewRequest(http.MethodPost, "/auth/register", bytes.NewBuffer(b))
    httpReq.Header.Set("Content-Type", "application/json")
    r.ServeHTTP(w, httpReq)

    assert.Equal(t, http.StatusCreated, w.Code)

    var resp dto.AuthResponse
    err := json.Unmarshal(w.Body.Bytes(), &resp)
    assert.NoError(t, err)
    assert.Equal(t, "token123", resp.Token)
}

func TestAuthHandler_Register_InvalidBody(t *testing.T) {
    ctrl := gomock.NewController(t)
    mockSvc := mocks.NewMockAuthServiceInterface(ctrl)
    h := handlers.NewAuthHandler(mockSvc)
    r := setupAuthRouter(h)

    w := httptest.NewRecorder()
    httpReq := httptest.NewRequest(http.MethodPost, "/auth/register", bytes.NewBufferString(`{invalid}`))
    httpReq.Header.Set("Content-Type", "application/json")
    r.ServeHTTP(w, httpReq)

    assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestAuthHandler_Register_EmailConflict(t *testing.T) {
    ctrl := gomock.NewController(t)
    mockSvc := mocks.NewMockAuthServiceInterface(ctrl)
    h := handlers.NewAuthHandler(mockSvc)
    r := setupAuthRouter(h)

    req := dto.RegisterRequest{
        Username: "alice",
        Email:    "alice@mail.com",
        Password: "password123",
    }
    mockSvc.EXPECT().
        Register(gomock.Any(), req).
        Return(nil, apperrors.ErrConflict("user with this email already exists"))

    b, _ := json.Marshal(req)
    w := httptest.NewRecorder()
    httpReq := httptest.NewRequest(http.MethodPost, "/auth/register", bytes.NewBuffer(b))
    httpReq.Header.Set("Content-Type", "application/json")
    r.ServeHTTP(w, httpReq)

    assert.Equal(t, http.StatusConflict, w.Code)

    var body map[string]string
    err := json.Unmarshal(w.Body.Bytes(), &body)
    assert.NoError(t, err)
    assert.Equal(t, "user with this email already exists", body["error"])
}

func TestAuthHandler_Register_InternalError(t *testing.T) {
    ctrl := gomock.NewController(t)
    mockSvc := mocks.NewMockAuthServiceInterface(ctrl)
    h := handlers.NewAuthHandler(mockSvc)
    r := setupAuthRouter(h)

    req := dto.RegisterRequest{
        Username: "alice",
        Email:    "alice@mail.com",
        Password: "password123",
    }
    mockSvc.EXPECT().
        Register(gomock.Any(), req).
        Return(nil, apperrors.ErrInternal(assert.AnError))

    b, _ := json.Marshal(req)
    w := httptest.NewRecorder()
    httpReq := httptest.NewRequest(http.MethodPost, "/auth/register", bytes.NewBuffer(b))
    httpReq.Header.Set("Content-Type", "application/json")
    r.ServeHTTP(w, httpReq)

    assert.Equal(t, http.StatusInternalServerError, w.Code)
}

// --- Login ---

func TestAuthHandler_Login_Success(t *testing.T) {
    ctrl := gomock.NewController(t)
    mockSvc := mocks.NewMockAuthServiceInterface(ctrl)
    h := handlers.NewAuthHandler(mockSvc)
    r := setupAuthRouter(h)

    req := dto.LoginRequest{
        Email:    "alice@mail.com",
        Password: "password123",
    }
    mockSvc.EXPECT().
        Login(gomock.Any(), req).
        Return(&dto.AuthResponse{Token: "token123"}, nil)

    b, _ := json.Marshal(req)
    w := httptest.NewRecorder()
    httpReq := httptest.NewRequest(http.MethodPost, "/auth/login", bytes.NewBuffer(b))
    httpReq.Header.Set("Content-Type", "application/json")
    r.ServeHTTP(w, httpReq)

    assert.Equal(t, http.StatusOK, w.Code)

    var resp dto.AuthResponse
    err := json.Unmarshal(w.Body.Bytes(), &resp)
    assert.NoError(t, err)
    assert.Equal(t, "token123", resp.Token)
}

func TestAuthHandler_Login_InvalidBody(t *testing.T) {
    ctrl := gomock.NewController(t)
    mockSvc := mocks.NewMockAuthServiceInterface(ctrl)
    h := handlers.NewAuthHandler(mockSvc)
    r := setupAuthRouter(h)

    w := httptest.NewRecorder()
    httpReq := httptest.NewRequest(http.MethodPost, "/auth/login", bytes.NewBufferString(`{invalid}`))
    httpReq.Header.Set("Content-Type", "application/json")
    r.ServeHTTP(w, httpReq)

    assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestAuthHandler_Login_InvalidCredentials(t *testing.T) {
    ctrl := gomock.NewController(t)
    mockSvc := mocks.NewMockAuthServiceInterface(ctrl)
    h := handlers.NewAuthHandler(mockSvc)
    r := setupAuthRouter(h)

    req := dto.LoginRequest{
        Email:    "alice@mail.com",
        Password: "wrongpassword",
    }
    mockSvc.EXPECT().
        Login(gomock.Any(), req).
        Return(nil, apperrors.ErrUnauthorized("invalid credentials"))

    b, _ := json.Marshal(req)
    w := httptest.NewRecorder()
    httpReq := httptest.NewRequest(http.MethodPost, "/auth/login", bytes.NewBuffer(b))
    httpReq.Header.Set("Content-Type", "application/json")
    r.ServeHTTP(w, httpReq)

    assert.Equal(t, http.StatusUnauthorized, w.Code)

    var body map[string]string
    err := json.Unmarshal(w.Body.Bytes(), &body)
    assert.NoError(t, err)
    assert.Equal(t, "invalid credentials", body["error"])
}

func TestAuthHandler_Login_InternalError(t *testing.T) {
    ctrl := gomock.NewController(t)
    mockSvc := mocks.NewMockAuthServiceInterface(ctrl)
    h := handlers.NewAuthHandler(mockSvc)
    r := setupAuthRouter(h)

    req := dto.LoginRequest{
        Email:    "alice@mail.com",
        Password: "password123",
    }
    mockSvc.EXPECT().
        Login(gomock.Any(), req).
        Return(nil, apperrors.ErrInternal(assert.AnError))

    b, _ := json.Marshal(req)
    w := httptest.NewRecorder()
    httpReq := httptest.NewRequest(http.MethodPost, "/auth/login", bytes.NewBuffer(b))
    httpReq.Header.Set("Content-Type", "application/json")
    r.ServeHTTP(w, httpReq)

    assert.Equal(t, http.StatusInternalServerError, w.Code)
}