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
)

func setupPublisherService(t *testing.T) (*services.PublisherService, *mocks.MockPublisherRepositoryInterface) {
	ctrl := gomock.NewController(t)
	mockRepo := mocks.NewMockPublisherRepositoryInterface(ctrl)
	svc := services.NewPublisherService(mockRepo)
	return svc, mockRepo
}

// --- Create ---

func TestPublisherService_Create_Success(t *testing.T) {
	svc, mockRepo := setupPublisherService(t)

	input := dto.PublisherInput{
		Name:    "Эксмо",
		Address: "Москва, ул. Правды, 1",
	}

	mockRepo.EXPECT().Create(gomock.Any(), gomock.Any()).Return(nil)

	result, err := svc.Create(context.Background(), input)

	assert.NoError(t, err)
	assert.Equal(t, "Эксмо", result.Name)
	assert.Equal(t, "Москва, ул. Правды, 1", result.Address)
}

func TestPublisherService_Create_RepoError(t *testing.T) {
	svc, mockRepo := setupPublisherService(t)

	input := dto.PublisherInput{Name: "Эксмо", Address: "Москва, ул. Правды, 1"}

	mockRepo.EXPECT().Create(gomock.Any(), gomock.Any()).Return(assert.AnError)

	result, err := svc.Create(context.Background(), input)

	assert.Nil(t, result)
	var appErr *apperrors.AppError
	assert.ErrorAs(t, err, &appErr)
	assert.Equal(t, 500, appErr.Code)
}

// --- GetByID ---

func TestPublisherService_GetByID_Success(t *testing.T) {
	svc, mockRepo := setupPublisherService(t)

	id := uuid.New()
	expected := &models.Publisher{ID: id, Name: "АСТ", Address: "Москва, Садовническая, 10"}

	mockRepo.EXPECT().GetByID(gomock.Any(), id).Return(expected, nil)

	result, err := svc.GetByID(context.Background(), id)

	assert.NoError(t, err)
	assert.Equal(t, expected, result)
}

func TestPublisherService_GetByID_NotFound(t *testing.T) {
	svc, mockRepo := setupPublisherService(t)

	id := uuid.New()
	mockRepo.EXPECT().GetByID(gomock.Any(), id).Return(nil, assert.AnError)

	result, err := svc.GetByID(context.Background(), id)

	assert.Nil(t, result)
	var appErr *apperrors.AppError
	assert.ErrorAs(t, err, &appErr)
	assert.Equal(t, 404, appErr.Code)
}

// --- GetAll ---

func TestPublisherService_GetAll_Success(t *testing.T) {
	svc, mockRepo := setupPublisherService(t)

	expected := []models.Publisher{
		{ID: uuid.New(), Name: "Эксмо", Address: "Москва, ул. Правды, 1"},
		{ID: uuid.New(), Name: "АСТ", Address: "Москва, Садовническая, 10"},
	}

	mockRepo.EXPECT().GetAll(gomock.Any()).Return(expected, nil)

	result, err := svc.GetAll(context.Background())

	assert.NoError(t, err)
	assert.Len(t, result, 2)
	assert.Equal(t, expected, result)
}

func TestPublisherService_GetAll_Empty(t *testing.T) {
	svc, mockRepo := setupPublisherService(t)

	mockRepo.EXPECT().GetAll(gomock.Any()).Return([]models.Publisher{}, nil)

	result, err := svc.GetAll(context.Background())

	assert.NoError(t, err)
	assert.Empty(t, result)
}

func TestPublisherService_GetAll_RepoError(t *testing.T) {
	svc, mockRepo := setupPublisherService(t)

	mockRepo.EXPECT().GetAll(gomock.Any()).Return(nil, assert.AnError)

	result, err := svc.GetAll(context.Background())

	assert.Nil(t, result)
	var appErr *apperrors.AppError
	assert.ErrorAs(t, err, &appErr)
	assert.Equal(t, 500, appErr.Code)
}

// --- Update ---

func TestPublisherService_Update_Success(t *testing.T) {
	svc, mockRepo := setupPublisherService(t)

	id := uuid.New()
	existing := &models.Publisher{ID: id, Name: "Старое", Address: "Старый адрес, ул. Прежняя, 5"}
	input := dto.PublisherInput{
		Name:    "Новое",
		Address: "Новый адрес, ул. Свежая, 10",
	}

	mockRepo.EXPECT().GetByID(gomock.Any(), id).Return(existing, nil)
	mockRepo.EXPECT().Update(gomock.Any(), gomock.Any()).Return(nil)

	result, err := svc.Update(context.Background(), id, input)

	assert.NoError(t, err)
	assert.Equal(t, "Новое", result.Name)
	assert.Equal(t, "Новый адрес, ул. Свежая, 10", result.Address)
}

func TestPublisherService_Update_NotFound(t *testing.T) {
	svc, mockRepo := setupPublisherService(t)

	id := uuid.New()
	mockRepo.EXPECT().GetByID(gomock.Any(), id).Return(nil, assert.AnError)

	result, err := svc.Update(context.Background(), id, dto.PublisherInput{})

	assert.Nil(t, result)
	var appErr *apperrors.AppError
	assert.ErrorAs(t, err, &appErr)
	assert.Equal(t, 404, appErr.Code)
}

func TestPublisherService_Update_RepoError(t *testing.T) {
	svc, mockRepo := setupPublisherService(t)

	id := uuid.New()
	existing := &models.Publisher{ID: id, Name: "Эксмо", Address: "Москва, ул. Правды, 1"}
	input := dto.PublisherInput{Name: "Новое", Address: "Новый адрес, ул. Свежая, 10"}

	mockRepo.EXPECT().GetByID(gomock.Any(), id).Return(existing, nil)
	mockRepo.EXPECT().Update(gomock.Any(), gomock.Any()).Return(assert.AnError)

	result, err := svc.Update(context.Background(), id, input)

	assert.Nil(t, result)
	var appErr *apperrors.AppError
	assert.ErrorAs(t, err, &appErr)
	assert.Equal(t, 500, appErr.Code)
}

// --- Delete ---

func TestPublisherService_Delete_Success(t *testing.T) {
	svc, mockRepo := setupPublisherService(t)

	id := uuid.New()
	mockRepo.EXPECT().Delete(gomock.Any(), id).Return(nil)

	err := svc.Delete(context.Background(), id)

	assert.NoError(t, err)
}

func TestPublisherService_Delete_RepoError(t *testing.T) {
	svc, mockRepo := setupPublisherService(t)

	id := uuid.New()
	mockRepo.EXPECT().Delete(gomock.Any(), id).Return(assert.AnError)

	err := svc.Delete(context.Background(), id)

	var appErr *apperrors.AppError
	assert.ErrorAs(t, err, &appErr)
	assert.Equal(t, 500, appErr.Code)
}