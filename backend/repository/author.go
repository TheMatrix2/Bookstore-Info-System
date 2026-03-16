package repository

import (
	"context"
	"fmt"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type AuthorRepository struct {
	db *bun.DB
}

func NewAuthorRepository(db *bun.DB) *AuthorRepository {
	return &AuthorRepository{db: db}
}

func (r *AuthorRepository) Create(ctx context.Context, author *models.Author) error {
	_, err := r.db.NewInsert().Model(author).Exec(ctx)
	return err
}

func (r *AuthorRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Author, error) {
	author := new(models.Author)
	err := r.db.NewSelect().Model(author).Where("id = ?", id).Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("author not found: %W", err)
	}
	return author, nil
}

func (r *AuthorRepository) GetAll(ctx context.Context) ([]models.Author, error) {
	var authors []models.Author
	err := r.db.NewSelect().Model(&authors).Scan(ctx)
	return authors, err
}

func (r *AuthorRepository) Update(ctx context.Context, author *models.Author) error {
	_, err := r.db.NewUpdate().Model(author).Where("id = ?", author.ID).Exec(ctx)
	if err != nil {
		return fmt.Errorf("failed to update author: %W", err)
	}
	return nil
}

func (r *AuthorRepository) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.NewDelete().Model((*models.Author)(nil)).Where("id = ?", id).Exec(ctx)
	if err != nil {
		return fmt.Errorf("failed to delete author: %W", err)
	}
	return nil
}