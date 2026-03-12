package repository

import (
	"context"
	"fmt"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

var CUSTOMER_ROLE = "user"
var EMPLOYEE_ROLES = []string{"admin", "manager", "delivery", "support"}

type UserRepository struct {
	db *bun.DB
}

func NewUserRepository(db *bun.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, user *models.User) error {
	_, err := r.db.NewInsert().Model(user).Exec(ctx)
	return err
}

func (r *UserRepository) GetRoleByName(ctx context.Context, name string) (*models.Role, error) {
    role := &models.Role{}
    err := r.db.NewSelect().
        Model(role).
        Where("name = ?", name).
        Scan(ctx)
    if err != nil {
        return nil, fmt.Errorf("role not found: %w", err)
    }
    return role, nil
}

func (r *UserRepository) GetAllCustomers(ctx context.Context) ([]models.User, error) {
    var users []models.User
    err := r.db.NewSelect().Model(&users).Relation("Role").Where("role.name = ?", CUSTOMER_ROLE).Scan(ctx)
    return users, err
}

func (r *UserRepository) GetAllEmployees(ctx context.Context) ([]models.User, error) {
    var users []models.User
    err := r.db.NewSelect().Model(&users).Relation("Role").Where("role.name IN (?)", bun.In(EMPLOYEE_ROLES)).Scan(ctx)
    return users, err
}

func (r *UserRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	user := new(models.User)
	err := r.db.NewSelect().Model(user).Relation("Role").Where("id = ?", id).Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("user not found: %W", err)
	}
	return user, nil
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
    user := &models.User{}
    err := r.db.NewSelect().
        Model(user).
        Relation("Role").
        Where("email = ?", email).
        Scan(ctx)
    if err != nil {
        return nil, fmt.Errorf("user not found: %w", err)
    }
    return user, nil
}

func (r *UserRepository) GetByUsername(ctx context.Context, username string) (*models.User, error) {
    user := &models.User{}
    err := r.db.NewSelect().
        Model(user).
        Where("username = ?", username).
        Scan(ctx)
    if err != nil {
        return nil, fmt.Errorf("user not found: %w", err)
    }
    return user, nil
}

func (r *UserRepository) Update(ctx context.Context, user *models.User) error {
    _, err := r.db.NewUpdate().Model(user).Where("id = ?", user.ID).Exec(ctx)
    if err != nil {
        return fmt.Errorf("failed to update user: %w", err)
    }
    return nil
}

func (r *UserRepository) Delete(ctx context.Context, user *models.User) error {
    _, err := r.db.NewDelete().Model(user).Where("id = ?", user.ID).Exec(ctx)
    if err != nil {
        return fmt.Errorf("failed to delete user: %w", err)
    }
    return nil
}