package services_test

import (
	"context"
	"testing"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/apperrors"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/dto"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/services"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/mocks"
	"github.com/golang/mock/gomock"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
)

func setupAuthService(t *testing.T) (*services.AuthService, *mocks.MockUserRepositoryInterface, *mocks.MockJWTServiceInterface) {
    ctrl := gomock.NewController(t)
    mockRepo := mocks.NewMockUserRepositoryInterface(ctrl)
    mockJWT := mocks.NewMockJWTServiceInterface(ctrl)
    svc := services.NewAuthService(mockRepo, mockJWT)
    return svc, mockRepo, mockJWT
}

// --- Register ---

func TestRegister_Success(t *testing.T) {
    svc, mockRepo, mockJWT := setupAuthService(t)

    req := dto.RegisterRequest{
        Username: "alice",
        Email:    "alice@mail.com",
        Password: "password123",
    }
    roleID := uuid.New()
    role := &models.Role{ID: roleID, Name: "user"}

    mockRepo.EXPECT().GetByEmail(gomock.Any(), req.Email).Return(nil, nil)
    mockRepo.EXPECT().GetByUsername(gomock.Any(), req.Username).Return(nil, nil)
    mockRepo.EXPECT().GetRoleByName(gomock.Any(), "user").Return(role, nil)
    mockRepo.EXPECT().Create(gomock.Any(), gomock.Any()).Return(nil)
    mockJWT.EXPECT().GenerateToken(gomock.Any(), "user").Return("token123", nil)

    resp, err := svc.Register(context.Background(), req)

    assert.NoError(t, err)
    assert.Equal(t, "token123", resp.Token)
}

func TestRegister_EmailAlreadyExists(t *testing.T) {
    svc, mockRepo, _ := setupAuthService(t)

    req := dto.RegisterRequest{Email: "alice@mail.com", Username: "alice", Password: "pass"}
    existing := &models.User{Email: "alice@mail.com"}

    mockRepo.EXPECT().GetByEmail(gomock.Any(), req.Email).Return(existing, nil)

    resp, err := svc.Register(context.Background(), req)

    assert.Nil(t, resp)
    var appErr *apperrors.AppError
    assert.ErrorAs(t, err, &appErr)
    assert.Equal(t, 409, appErr.Code)
}

func TestRegister_UsernameAlreadyExists(t *testing.T) {
    svc, mockRepo, _ := setupAuthService(t)

    req := dto.RegisterRequest{Email: "alice@mail.com", Username: "alice", Password: "pass"}
    existing := &models.User{Username: "alice"}

    mockRepo.EXPECT().GetByEmail(gomock.Any(), req.Email).Return(nil, nil)
    mockRepo.EXPECT().GetByUsername(gomock.Any(), req.Username).Return(existing, nil)

    resp, err := svc.Register(context.Background(), req)

    assert.Nil(t, resp)
    var appErr *apperrors.AppError
    assert.ErrorAs(t, err, &appErr)
    assert.Equal(t, 409, appErr.Code)
}

func TestRegister_GetEmailRepoError(t *testing.T) {
    svc, mockRepo, _ := setupAuthService(t)

    req := dto.RegisterRequest{Email: "alice@mail.com", Username: "alice", Password: "pass"}

    mockRepo.EXPECT().GetByEmail(gomock.Any(), req.Email).Return(nil, assert.AnError)

    resp, err := svc.Register(context.Background(), req)

    assert.Nil(t, resp)
    var appErr *apperrors.AppError
    assert.ErrorAs(t, err, &appErr)
    assert.Equal(t, 500, appErr.Code)
}

func TestRegister_RoleNotFound(t *testing.T) {
    svc, mockRepo, _ := setupAuthService(t)

    req := dto.RegisterRequest{Email: "alice@mail.com", Username: "alice", Password: "pass"}

    mockRepo.EXPECT().GetByEmail(gomock.Any(), req.Email).Return(nil, nil)
    mockRepo.EXPECT().GetByUsername(gomock.Any(), req.Username).Return(nil, nil)
    mockRepo.EXPECT().GetRoleByName(gomock.Any(), "user").Return(nil, assert.AnError)

    resp, err := svc.Register(context.Background(), req)

    assert.Nil(t, resp)
    assert.Error(t, err)
}

func TestRegister_CreateUserError(t *testing.T) {
    svc, mockRepo, _ := setupAuthService(t)

    req := dto.RegisterRequest{Email: "alice@mail.com", Username: "alice", Password: "pass"}
    role := &models.Role{ID: uuid.New(), Name: "user"}

    mockRepo.EXPECT().GetByEmail(gomock.Any(), req.Email).Return(nil, nil)
    mockRepo.EXPECT().GetByUsername(gomock.Any(), req.Username).Return(nil, nil)
    mockRepo.EXPECT().GetRoleByName(gomock.Any(), "user").Return(role, nil)
    mockRepo.EXPECT().Create(gomock.Any(), gomock.Any()).Return(assert.AnError)

    resp, err := svc.Register(context.Background(), req)

    assert.Nil(t, resp)
    assert.Error(t, err)
}

func TestRegister_GenerateTokenError(t *testing.T) {
    svc, mockRepo, mockJWT := setupAuthService(t)

    req := dto.RegisterRequest{Email: "alice@mail.com", Username: "alice", Password: "pass"}
    role := &models.Role{ID: uuid.New(), Name: "user"}

    mockRepo.EXPECT().GetByEmail(gomock.Any(), req.Email).Return(nil, nil)
    mockRepo.EXPECT().GetByUsername(gomock.Any(), req.Username).Return(nil, nil)
    mockRepo.EXPECT().GetRoleByName(gomock.Any(), "user").Return(role, nil)
    mockRepo.EXPECT().Create(gomock.Any(), gomock.Any()).Return(nil)
    mockJWT.EXPECT().GenerateToken(gomock.Any(), "user").Return("", assert.AnError)

    resp, err := svc.Register(context.Background(), req)

    assert.Nil(t, resp)
    assert.Error(t, err)
}

// --- Login ---

func TestLogin_Success(t *testing.T) {
    svc, mockRepo, mockJWT := setupAuthService(t)

    // Генерируем реальный bcrypt хеш для теста
    password := "password123"
    hash, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    role := &models.Role{Name: "user"}
    user := &models.User{
        ID:           uuid.New(),
        Email:        "alice@mail.com",
        PasswordHash: string(hash),
        Role:         role,
    }

    req := dto.LoginRequest{Email: "alice@mail.com", Password: password}

    mockRepo.EXPECT().GetByEmail(gomock.Any(), req.Email).Return(user, nil)
    mockJWT.EXPECT().GenerateToken(user.ID, "user").Return("token123", nil)

    resp, err := svc.Login(context.Background(), req)

    assert.NoError(t, err)
    assert.Equal(t, "token123", resp.Token)
}

func TestLogin_UserNotFound(t *testing.T) {
    svc, mockRepo, _ := setupAuthService(t)

    req := dto.LoginRequest{Email: "nobody@mail.com", Password: "pass"}
    mockRepo.EXPECT().GetByEmail(gomock.Any(), req.Email).Return(nil, assert.AnError)

    resp, err := svc.Login(context.Background(), req)

    assert.Nil(t, resp)
    assert.Error(t, err)
}

func TestLogin_WrongPassword(t *testing.T) {
    svc, mockRepo, _ := setupAuthService(t)

    hash, _ := bcrypt.GenerateFromPassword([]byte("correct-password"), bcrypt.DefaultCost)
    user := &models.User{
        ID:           uuid.New(),
        PasswordHash: string(hash),
        Role:         &models.Role{Name: "user"},
    }

    req := dto.LoginRequest{Email: "alice@mail.com", Password: "wrong-password"}
    mockRepo.EXPECT().GetByEmail(gomock.Any(), req.Email).Return(user, nil)

    resp, err := svc.Login(context.Background(), req)

    assert.Nil(t, resp)
    assert.Error(t, err)
}

func TestLogin_GenerateTokenError(t *testing.T) {
    svc, mockRepo, mockJWT := setupAuthService(t)

    password := "password123"
    hash, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    user := &models.User{
        ID:           uuid.New(),
        PasswordHash: string(hash),
        Role:         &models.Role{Name: "user"},
    }

    req := dto.LoginRequest{Email: "alice@mail.com", Password: password}
    mockRepo.EXPECT().GetByEmail(gomock.Any(), req.Email).Return(user, nil)
    mockJWT.EXPECT().GenerateToken(user.ID, "user").Return("", assert.AnError)

    resp, err := svc.Login(context.Background(), req)

    assert.Nil(t, resp)
    assert.Error(t, err)
}

func TestLogin_NoRole(t *testing.T) {
    svc, mockRepo, mockJWT := setupAuthService(t)

    password := "password123"
    hash, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    // Role == nil — роль не подгружена
    user := &models.User{
        ID:           uuid.New(),
        PasswordHash: string(hash),
        Role:         nil,
    }

    req := dto.LoginRequest{Email: "alice@mail.com", Password: password}
    mockRepo.EXPECT().GetByEmail(gomock.Any(), req.Email).Return(user, nil)
    mockJWT.EXPECT().GenerateToken(user.ID, "").Return("token123", nil)

    resp, err := svc.Login(context.Background(), req)

    assert.NoError(t, err)
    assert.Equal(t, "token123", resp.Token)
}