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

func setupAuthorService(t *testing.T) (*services.AuthorService, *mocks.MockAuthorRepositoryInterface) {
	ctrl := gomock.NewController(t)
	mockRepo := mocks.NewMockAuthorRepositoryInterface(ctrl)
	svc := services.NewAuthorService(mockRepo)
	return svc, mockRepo
}

// --- Create ---

func TestAuthorService_Create_Success(t *testing.T) {
	svc, mockRepo := setupAuthorService(t)

	info := "Russian classic writer"
	input := dto.AuthorInput{
		Surname:    "Толстой",
		Name:       "Лев",
		Patronymic: "Николаевич",
		Info:       &info,
	}

	mockRepo.EXPECT().Create(gomock.Any(), gomock.Any()).Return(nil)

	result, err := svc.Create(context.Background(), input)

	assert.NoError(t, err)
	assert.Equal(t, "Толстой", result.Surname)
	assert.Equal(t, "Лев", result.Name)
	assert.Equal(t, "Николаевич", result.Patronymic)
	assert.Equal(t, &info, result.Info)
}

func TestAuthorService_Create_RepoError(t *testing.T) {
	svc, mockRepo := setupAuthorService(t)

	input := dto.AuthorInput{Surname: "Толстой", Name: "Лев", Patronymic: "Николаевич"}

	mockRepo.EXPECT().Create(gomock.Any(), gomock.Any()).Return(assert.AnError)

	result, err := svc.Create(context.Background(), input)

	assert.Nil(t, result)
	var appErr *apperrors.AppError
	assert.ErrorAs(t, err, &appErr)
	assert.Equal(t, 500, appErr.Code)
}

func TestAuthorService_Create_NilInfo(t *testing.T) {
	svc, mockRepo := setupAuthorService(t)

	input := dto.AuthorInput{Surname: "Достоевский", Name: "Фёдор", Patronymic: "Михайлович"}

	mockRepo.EXPECT().Create(gomock.Any(), gomock.Any()).Return(nil)

	result, err := svc.Create(context.Background(), input)

	assert.NoError(t, err)
	assert.Nil(t, result.Info)
}

// --- GetByID ---

func TestAuthorService_GetByID_Success(t *testing.T) {
	svc, mockRepo := setupAuthorService(t)

	id := uuid.New()
	expected := &models.Author{ID: id, Surname: "Пушкин", Name: "Александр", Patronymic: "Сергеевич"}

	mockRepo.EXPECT().GetByID(gomock.Any(), id).Return(expected, nil)

	result, err := svc.GetByID(context.Background(), id)

	assert.NoError(t, err)
	assert.Equal(t, expected, result)
}

func TestAuthorService_GetByID_NotFound(t *testing.T) {
	svc, mockRepo := setupAuthorService(t)

	id := uuid.New()
	mockRepo.EXPECT().GetByID(gomock.Any(), id).Return(nil, assert.AnError)

	result, err := svc.GetByID(context.Background(), id)

	assert.Nil(t, result)
	var appErr *apperrors.AppError
	assert.ErrorAs(t, err, &appErr)
	assert.Equal(t, 404, appErr.Code)
}

// --- GetAll ---

func TestAuthorService_GetAll_Success(t *testing.T) {
	svc, mockRepo := setupAuthorService(t)

	expected := []models.Author{
		{ID: uuid.New(), Surname: "Пушкин", Name: "Александр", Patronymic: "Сергеевич"},
		{ID: uuid.New(), Surname: "Толстой", Name: "Лев", Patronymic: "Николаевич"},
	}

	mockRepo.EXPECT().GetAll(gomock.Any()).Return(expected, nil)

	result, err := svc.GetAll(context.Background())

	assert.NoError(t, err)
	assert.Len(t, result, 2)
	assert.Equal(t, expected, result)
}

func TestAuthorService_GetAll_Empty(t *testing.T) {
	svc, mockRepo := setupAuthorService(t)

	mockRepo.EXPECT().GetAll(gomock.Any()).Return([]models.Author{}, nil)

	result, err := svc.GetAll(context.Background())

	assert.NoError(t, err)
	assert.Empty(t, result)
}

func TestAuthorService_GetAll_RepoError(t *testing.T) {
	svc, mockRepo := setupAuthorService(t)

	mockRepo.EXPECT().GetAll(gomock.Any()).Return(nil, assert.AnError)

	result, err := svc.GetAll(context.Background())

	assert.Nil(t, result)
	var appErr *apperrors.AppError
	assert.ErrorAs(t, err, &appErr)
	assert.Equal(t, 500, appErr.Code)
}

// --- Update ---

func TestAuthorService_Update_Success(t *testing.T) {
	svc, mockRepo := setupAuthorService(t)

	id := uuid.New()
	existing := &models.Author{ID: id, Surname: "Старый", Name: "Автор", Patronymic: "Отчество"}
	newInfo := "Updated bio"
	input := dto.AuthorInput{
		Surname:    "Новый",
		Name:       "Автор",
		Patronymic: "Отчество",
		Info:       &newInfo,
	}

	mockRepo.EXPECT().GetByID(gomock.Any(), id).Return(existing, nil)
	mockRepo.EXPECT().Update(gomock.Any(), gomock.Any()).Return(nil)

	result, err := svc.Update(context.Background(), id, input)

	assert.NoError(t, err)
	assert.Equal(t, "Новый", result.Surname)
	assert.Equal(t, &newInfo, result.Info)
}

func TestAuthorService_Update_NotFound(t *testing.T) {
	svc, mockRepo := setupAuthorService(t)

	id := uuid.New()
	mockRepo.EXPECT().GetByID(gomock.Any(), id).Return(nil, assert.AnError)

	result, err := svc.Update(context.Background(), id, dto.AuthorInput{})

	assert.Nil(t, result)
	var appErr *apperrors.AppError
	assert.ErrorAs(t, err, &appErr)
	assert.Equal(t, 404, appErr.Code)
}

func TestAuthorService_Update_RepoError(t *testing.T) {
	svc, mockRepo := setupAuthorService(t)

	id := uuid.New()
	existing := &models.Author{ID: id, Surname: "Автор", Name: "Имя", Patronymic: "Отч"}
	input := dto.AuthorInput{Surname: "Новый", Name: "Имя", Patronymic: "Отч"}

	mockRepo.EXPECT().GetByID(gomock.Any(), id).Return(existing, nil)
	mockRepo.EXPECT().Update(gomock.Any(), gomock.Any()).Return(assert.AnError)

	result, err := svc.Update(context.Background(), id, input)

	assert.Nil(t, result)
	var appErr *apperrors.AppError
	assert.ErrorAs(t, err, &appErr)
	assert.Equal(t, 500, appErr.Code)
}

// --- Delete ---

func TestAuthorService_Delete_Success(t *testing.T) {
	svc, mockRepo := setupAuthorService(t)

	id := uuid.New()
	mockRepo.EXPECT().Delete(gomock.Any(), id).Return(nil)

	err := svc.Delete(context.Background(), id)

	assert.NoError(t, err)
}

func TestAuthorService_Delete_RepoError(t *testing.T) {
	svc, mockRepo := setupAuthorService(t)

	id := uuid.New()
	mockRepo.EXPECT().Delete(gomock.Any(), id).Return(assert.AnError)

	err := svc.Delete(context.Background(), id)

	var appErr *apperrors.AppError
	assert.ErrorAs(t, err, &appErr)
	assert.Equal(t, 500, appErr.Code)
}