package repository

import (
	"context"
	"fmt"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type CategoryRepository struct {
	db *bun.DB
}

func NewCategoryRepository(db *bun.DB) *CategoryRepository {
	return &CategoryRepository{db: db}
}

func (r *CategoryRepository) Create(ctx context.Context, category *models.Category) error {
	_, err := r.db.NewInsert().Model(category).Exec(ctx)
	return err
}

func (r *CategoryRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Category, error) {
	category := new(models.Category)
	err := r.db.NewSelect().Model(category).Where("id = ?", id).Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("category not found: %W", err)
	}
	return category, nil
}

func (r *CategoryRepository) GetAll(ctx context.Context) ([]models.Category, error) {
	var categories []models.Category
	err := r.db.NewSelect().Model(&categories).Scan(ctx)
	return categories, err
}

func (r *CategoryRepository) Update(ctx context.Context, category *models.Category) error {
	_, err := r.db.NewUpdate().Model(category).WherePK().Exec(ctx)
	return err
}

func (r *CategoryRepository) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.NewDelete().Model(&models.Category{}).Where("id = ?", id).Exec(ctx)
	if err != nil {
		return fmt.Errorf("failed to delete category: %W", err)
	}
	return nil
}