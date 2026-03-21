package repository

import (
	"context"
	"fmt"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type PublisherRepository struct{
	db	*bun.DB
}

func NewPublisherRepository(db *bun.DB) *PublisherRepository {
	return &PublisherRepository{db: db}
}

func (r *PublisherRepository) Create(ctx context.Context, publisher *models.Publisher) error {
	_, err := r.db.NewInsert().Model(publisher).Exec(ctx)
	return err
}

func (r *PublisherRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Publisher, error) {
	publisher := new(models.Publisher)
	err := r.db.NewSelect().Model(publisher).Where("id = ?", id).Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("publisher not found: %W", err)
	}
	return publisher, nil
}

func (r *PublisherRepository) GetAll(ctx context.Context) ([]models.Publisher, error) {
	var publishers []models.Publisher
	err := r.db.NewSelect().Model(&publishers).Scan(ctx)
	return publishers, err
}

func (r *PublisherRepository) Update(ctx context.Context, publisher *models.Publisher) error {
	_, err := r.db.NewUpdate().Model(publisher).Where("id = ?", publisher.ID).Exec(ctx)
	if err != nil {
		return fmt.Errorf("failed to update publisher: %W", err)
	}
	return nil
}

func (r *PublisherRepository) Delete(ctx context.Context, id uuid.UUID) error {
	_, err := r.db.NewDelete().Model((*models.Publisher)(nil)).Where("id = ?", id).Exec(ctx)
	if err != nil {
		return fmt.Errorf("failed to delete publisher: %W", err)
	}
	return nil
}