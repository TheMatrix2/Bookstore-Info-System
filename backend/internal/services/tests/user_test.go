package services_test

import (
    "context"
    "testing"

    "github.com/TheMatrix2/Bookstore-Info-System/backend/internal/apperrors"
    "github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
    "github.com/TheMatrix2/Bookstore-Info-System/backend/internal/services"
    "github.com/TheMatrix2/Bookstore-Info-System/backend/internal/dto"
    "github.com/TheMatrix2/Bookstore-Info-System/backend/mocks"
    "github.com/google/uuid"
    "github.com/stretchr/testify/assert"
    "github.com/golang/mock/gomock"
)

func setupUserService(t *testing.T) (*services.UserService, *mocks.MockUserRepositoryInterface) {
    ctrl := gomock.NewController(t)
    mockRepo := mocks.NewMockUserRepositoryInterface(ctrl)
    svc := services.NewUserService(mockRepo)
    return svc, mockRepo
}

// --- GetAllCustomers ---

func TestGetAllCustomers_Success(t *testing.T) {
    svc, mockRepo := setupUserService(t)

    expected := []models.User{
        {ID: uuid.New(), Username: "alice"},
        {ID: uuid.New(), Username: "bob"},
    }
    mockRepo.EXPECT().
        GetAllCustomers(gomock.Any()).
        Return(expected, nil)

    result, err := svc.GetAllCustomers(context.Background())

    assert.NoError(t, err)
    assert.Equal(t, expected, result)
}

func TestGetAllCustomers_RepoError(t *testing.T) {
    svc, mockRepo := setupUserService(t)

    mockRepo.EXPECT().
        GetAllCustomers(gomock.Any()).
        Return(nil, assert.AnError)

    result, err := svc.GetAllCustomers(context.Background())

    assert.Nil(t, result)
    var appErr *apperrors.AppError
    assert.ErrorAs(t, err, &appErr)
}

// --- GetAllEmployees ---

func TestGetAllEmployees_Success(t *testing.T) {
    svc, mockRepo := setupUserService(t)

    expected := []models.User{
        {ID: uuid.New(), Username: "admin_user"},
    }
    mockRepo.EXPECT().
        GetAllEmployees(gomock.Any()).
        Return(expected, nil)

    result, err := svc.GetAllEmployees(context.Background())

    assert.NoError(t, err)
    assert.Equal(t, expected, result)
}

func TestGetAllEmployees_RepoError(t *testing.T) {
    svc, mockRepo := setupUserService(t)

    mockRepo.EXPECT().
        GetAllEmployees(gomock.Any()).
        Return(nil, assert.AnError)

    result, err := svc.GetAllEmployees(context.Background())

    assert.Nil(t, result)
    var appErr *apperrors.AppError
    assert.ErrorAs(t, err, &appErr)
}

// --- GetByID ---

func TestGetByID_Success(t *testing.T) {
    svc, mockRepo := setupUserService(t)

    id := uuid.New()
    expected := &models.User{ID: id, Username: "alice"}

    mockRepo.EXPECT().
        GetByID(gomock.Any(), id).
        Return(expected, nil)

    result, err := svc.GetByID(context.Background(), id)

    assert.NoError(t, err)
    assert.Equal(t, expected, result)
}

func TestGetByID_NotFound(t *testing.T) {
    svc, mockRepo := setupUserService(t)

    id := uuid.New()
    mockRepo.EXPECT().
        GetByID(gomock.Any(), id).
        Return(nil, assert.AnError)

    result, err := svc.GetByID(context.Background(), id)

    assert.Nil(t, result)
    var appErr *apperrors.AppError
    assert.ErrorAs(t, err, &appErr)
    assert.Equal(t, 404, appErr.Code)
}

// --- Update ---

func TestUpdate_Success(t *testing.T) {
    svc, mockRepo := setupUserService(t)

    id := uuid.New()
    phone := "+31612345678"
    existing := &models.User{ID: id, Username: "old", Email: "old@mail.com"}
    req := dto.UpdateUserRequest{
        Username: "new",
        Email:    "new@mail.com",
        Phone:    &phone,
    }

    mockRepo.EXPECT().GetByID(gomock.Any(), id).Return(existing, nil)
    mockRepo.EXPECT().Update(gomock.Any(), gomock.Any()).Return(nil)

    result, err := svc.Update(context.Background(), id, req)

    assert.NoError(t, err)
    assert.Equal(t, "new", result.Username)
    assert.Equal(t, "new@mail.com", result.Email)
    assert.Equal(t, &phone, result.Phone)
}

func TestUpdate_UserNotFound(t *testing.T) {
    svc, mockRepo := setupUserService(t)

    id := uuid.New()
    mockRepo.EXPECT().GetByID(gomock.Any(), id).Return(nil, assert.AnError)

    result, err := svc.Update(context.Background(), id, dto.UpdateUserRequest{})

    assert.Nil(t, result)
    var appErr *apperrors.AppError
    assert.ErrorAs(t, err, &appErr)
    assert.Equal(t, 404, appErr.Code)
}

func TestUpdate_RepoError(t *testing.T) {
    svc, mockRepo := setupUserService(t)

    id := uuid.New()
    existing := &models.User{ID: id, Username: "alice"}

    mockRepo.EXPECT().GetByID(gomock.Any(), id).Return(existing, nil)
    mockRepo.EXPECT().Update(gomock.Any(), gomock.Any()).Return(assert.AnError)

    result, err := svc.Update(context.Background(), id, dto.UpdateUserRequest{Username: "new"})

    assert.Nil(t, result)
    var appErr *apperrors.AppError
    assert.ErrorAs(t, err, &appErr)
    assert.Equal(t, 500, appErr.Code)
}

// --- Delete ---

func TestDelete_Success(t *testing.T) {
    svc, mockRepo := setupUserService(t)

    id := uuid.New()
    existing := &models.User{ID: id}

    mockRepo.EXPECT().GetByID(gomock.Any(), id).Return(existing, nil)
    mockRepo.EXPECT().Delete(gomock.Any(), existing).Return(nil)

    err := svc.Delete(context.Background(), id)
    assert.NoError(t, err)
}

func TestDelete_UserNotFound(t *testing.T) {
    svc, mockRepo := setupUserService(t)

    id := uuid.New()
    mockRepo.EXPECT().GetByID(gomock.Any(), id).Return(nil, assert.AnError)

    err := svc.Delete(context.Background(), id)

    var appErr *apperrors.AppError
    assert.ErrorAs(t, err, &appErr)
    assert.Equal(t, 404, appErr.Code)
}

func TestDelete_RepoError(t *testing.T) {
    svc, mockRepo := setupUserService(t)

    id := uuid.New()
    existing := &models.User{ID: id}

    mockRepo.EXPECT().GetByID(gomock.Any(), id).Return(existing, nil)
    mockRepo.EXPECT().Delete(gomock.Any(), existing).Return(assert.AnError)

    err := svc.Delete(context.Background(), id)

    var appErr *apperrors.AppError
    assert.ErrorAs(t, err, &appErr)
    assert.Equal(t, 500, appErr.Code)
}