package repository

import (
	"context"
	"fmt"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"github.com/uptrace/bun"
)

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

func (r *UserRepository) GetByID(ctx context.Context, id string) (*models.User, error) {
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