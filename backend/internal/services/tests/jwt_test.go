package services_test

import (
	"testing"
	"time"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/interfaces"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/services"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func setupJWTService() *services.JWTService {
	return services.NewJWTService("test-secret", 24)
}

// --- GenerateToken ---

func TestGenerateToken_Success(t *testing.T) {
	svc := setupJWTService()
	userID := uuid.New()

	token, err := svc.GenerateToken(userID, "user")

	assert.NoError(t, err)
	assert.NotEmpty(t, token)
}

func TestGenerateToken_DifferentRoles(t *testing.T) {
	svc := setupJWTService()
	userID := uuid.New()

	tokenUser, _ := svc.GenerateToken(userID, "user")
	tokenAdmin, _ := svc.GenerateToken(userID, "admin")

	// Токены должны быть разными для разных ролей
	assert.NotEqual(t, tokenUser, tokenAdmin)
}

func TestGenerateToken_ContainsClaims(t *testing.T) {
	svc := setupJWTService()
	userID := uuid.New()

	tokenStr, err := svc.GenerateToken(userID, "admin")
	assert.NoError(t, err)

	// Валидируем и проверяем claims
	claims, err := svc.ValidateToken(tokenStr)
	assert.NoError(t, err)
	assert.Equal(t, userID, claims.UserID)
	assert.Equal(t, "admin", claims.Role)
}

// --- ValidateToken ---

func TestValidateToken_Success(t *testing.T) {
	svc := setupJWTService()
	userID := uuid.New()

	tokenStr, _ := svc.GenerateToken(userID, "user")
	claims, err := svc.ValidateToken(tokenStr)

	assert.NoError(t, err)
	assert.Equal(t, userID, claims.UserID)
	assert.Equal(t, "user", claims.Role)
}

func TestValidateToken_InvalidToken(t *testing.T) {
	svc := setupJWTService()

	claims, err := svc.ValidateToken("this.is.not.a.token")

	assert.Error(t, err)
	assert.Nil(t, claims)
}

func TestValidateToken_WrongSecret(t *testing.T) {
	svc1 := services.NewJWTService("secret-one", 24)
	svc2 := services.NewJWTService("secret-two", 24)

	tokenStr, _ := svc1.GenerateToken(uuid.New(), "user")
	claims, err := svc2.ValidateToken(tokenStr)

	assert.Error(t, err)
	assert.Nil(t, claims)
}

func TestValidateToken_ExpiredToken(t *testing.T) {
	// Создаём сервис с истёкшим сроком (-1 час)
	svc := services.NewJWTService("test-secret", -1)

	tokenStr, _ := svc.GenerateToken(uuid.New(), "user")
	claims, err := svc.ValidateToken(tokenStr)

	assert.Error(t, err)
	assert.Nil(t, claims)
}

func TestValidateToken_TamperedToken(t *testing.T) {
	svc := setupJWTService()

	tokenStr, _ := svc.GenerateToken(uuid.New(), "user")
	// Портим последний символ токена
	tampered := tokenStr[:len(tokenStr)-1] + "X"

	claims, err := svc.ValidateToken(tampered)

	assert.Error(t, err)
	assert.Nil(t, claims)
}

func TestValidateToken_WrongSigningMethod(t *testing.T) {
	// Создаём токен с RS256 вместо HS256
	token := jwt.NewWithClaims(jwt.SigningMethodNone, interfaces.Token{
		UserID: uuid.New(),
		Role:   "user",
	})
	tokenStr, _ := token.SignedString(jwt.UnsafeAllowNoneSignatureType)

	svc := setupJWTService()
	claims, err := svc.ValidateToken(tokenStr)

	assert.Error(t, err)
	assert.Nil(t, claims)
}

func TestValidateToken_ExpirationIsSet(t *testing.T) {
	svc := services.NewJWTService("test-secret", 2)
	userID := uuid.New()

	tokenStr, _ := svc.GenerateToken(userID, "user")
	claims, err := svc.ValidateToken(tokenStr)

	assert.NoError(t, err)
	assert.True(t, claims.ExpiresAt.After(time.Now()))
}
