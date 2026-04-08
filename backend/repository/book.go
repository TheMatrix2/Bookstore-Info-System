package repository

import (
	"context"
	"fmt"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/dto"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type BookRepository struct {
	db *bun.DB
}

func NewBookRepository(db *bun.DB) *BookRepository {
	return &BookRepository{db: db}
}

func (r *BookRepository) Create(ctx context.Context, book *models.Book, categoryIDs []uuid.UUID) error {
	return r.db.RunInTx(ctx, nil, func(ctx context.Context, tx bun.Tx) error {
		_, err := r.db.NewInsert().Model(book).Exec(ctx)
		if err != nil {
			return fmt.Errorf("failed to create book: %W", err)
		}
		
		if len(categoryIDs) > 0 {
			relations := make([]models.BookToCategory, len(categoryIDs))
			for i, catID := range categoryIDs {
				relations[i] = models.BookToCategory{
					BookID: book.ID,
					CategoryID: catID,
				}
			}
			_, err := r.db.NewInsert().Model(&relations).Exec(ctx)
			if err != nil {
				return fmt.Errorf("failed to create book-category relations: %W", err)
			}
		}
		return nil
	})
}

func (r *BookRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Book, error) {
	book := new(models.Book)
	err := r.db.NewSelect().Model(book).
		Relation("Author").
		Relation("Publisher").
		Relation("Categories").
		Where("id = ?", id).
		Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("book not found: %W", err)
	}
	return book, nil
}

func (r *BookRepository) GetAll(ctx context.Context, filter dto.BookFilter) ([]models.Book, error) {
	var books []models.Book
	query := r.db.NewSelect().
			Model(&books).
			Relation("Author").
			Relation("Publisher").
			Relation("Categories")

	if filter.AuthorID != nil {
		query = query.Where("book.author_id = ?", filter.AuthorID)
	}
	if filter.CategoryID != nil {
		query = query.Join("JOIN book_to_category btc ON btc.book_id = book.id").
			Where("btc.category_id = ?", *filter.CategoryID)
	}
	if filter.MinPrice != nil {
		query = query.Where("book.price >= ?", *filter.MinPrice)
	}
	if filter.MaxPrice != nil {
		query = query.Where("book.price <= ?", *filter.MaxPrice)
	}
	if filter.Search != nil {
		searchTerm := "%" + *filter.Search + "%"
		query = query.Where("book.title ILIKE ? OR book.description ILIKE ?", searchTerm, searchTerm)
	}

	err := query.Scan(ctx)

	return books, err
}

func (r *BookRepository) Update(ctx context.Context, book *models.Book, categoryIDs []uuid.UUID) error {
	return r.db.RunInTx(ctx, nil, func(ctx context.Context, tx bun.Tx) error {
		if _, err := r.db.NewUpdate().Model(book).WherePK().Exec(ctx); err != nil {
			return fmt.Errorf("failed to update book: %W", err)
		}

		if _, err := tx.NewDelete().Model(&models.BookToCategory{}).Where("book_id = ?", book.ID).Exec(ctx); err != nil {
			return fmt.Errorf("failed to delete old book-category relations: %W", err)
		}
		
		if len(categoryIDs) > 0 {
			relations := make([]models.BookToCategory, len(categoryIDs))
			for i, catID := range categoryIDs {
				relations[i] = models.BookToCategory{
					BookID: book.ID,
					CategoryID: catID,
				}
			}
			_, err := tx.NewInsert().Model(&relations).Exec(ctx)
			if err != nil {
				return fmt.Errorf("failed to create new book-category relations: %W", err)
			}
		}
		return nil
	})
}

func (r *BookRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.RunInTx(ctx, nil, func(ctx context.Context, tx bun.Tx) error {
		if _, err := tx.NewDelete().Model(&models.BookToCategory{}).Where("book_id = ?", id).Exec(ctx); err != nil {
			return fmt.Errorf("failed to delete book-category relations: %W", err)
		}
		if _, err := tx.NewDelete().Model(&models.Book{}).Where("id = ?", id).Exec(ctx); err != nil {
			return fmt.Errorf("failed to delete book: %W", err)
		}
		return nil
	})
}