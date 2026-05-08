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

func parseUUIDs(raw []string) []uuid.UUID {
	result := make([]uuid.UUID, 0, len(raw))
	for _, s := range raw {
		if u, err := uuid.Parse(s); err == nil {
			result = append(result, u)
		}
	}
	return result
}

func (r *BookRepository) Create(ctx context.Context, book *models.Book, authorIDs []uuid.UUID, categoryIDs []uuid.UUID) error {
	return r.db.RunInTx(ctx, nil, func(ctx context.Context, tx bun.Tx) error {
		if _, err := tx.NewInsert().Model(book).Exec(ctx); err != nil {
			return fmt.Errorf("failed to create book: %w", err)
		}

		if len(authorIDs) > 0 {
			rels := make([]models.BookToAuthor, len(authorIDs))
			for i, aid := range authorIDs {
				rels[i] = models.BookToAuthor{BookID: book.ID, AuthorID: aid}
			}
			if _, err := tx.NewInsert().Model(&rels).Exec(ctx); err != nil {
				return fmt.Errorf("failed to create book-author relations: %w", err)
			}
		}

		if len(categoryIDs) > 0 {
			rels := make([]models.BookToCategory, len(categoryIDs))
			for i, cid := range categoryIDs {
				rels[i] = models.BookToCategory{BookID: book.ID, CategoryID: cid}
			}
			if _, err := tx.NewInsert().Model(&rels).Exec(ctx); err != nil {
				return fmt.Errorf("failed to create book-category relations: %w", err)
			}
		}
		return nil
	})
}

func (r *BookRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Book, error) {
	book := new(models.Book)
	err := r.db.NewSelect().Model(book).
		Relation("Authors").
		Relation("Publisher").
		Relation("Categories").
		Where("\"book\".\"id\" = ?", id).
		Scan(ctx)
	if err != nil {
		return nil, fmt.Errorf("book not found: %w", err)
	}
	return book, nil
}

func (r *BookRepository) GetAll(ctx context.Context, filter dto.BookFilter) ([]models.Book, error) {
	var books []models.Book
	query := r.db.NewSelect().
		Model(&books).
		Relation("Authors").
		Relation("Publisher").
		Relation("Categories")

	authorUUIDs := parseUUIDs(filter.AuthorIDs)
	if len(authorUUIDs) > 0 {
		query = query.
			Join("JOIN book_to_author bta ON bta.book_id = \"book\".id").
			Where("bta.author_id IN (?)", bun.In(authorUUIDs))
	}

	categoryUUIDs := parseUUIDs(filter.CategoryIDs)
	if len(categoryUUIDs) > 0 {
		query = query.
			Join("JOIN book_to_category btc ON btc.book_id = \"book\".id").
			Where("btc.category_id IN (?)", bun.In(categoryUUIDs))
	}

	if filter.PublisherID != nil {
		if pid, err := uuid.Parse(*filter.PublisherID); err == nil {
			query = query.Where("\"book\".\"publisher_id\" = ?", pid)
		}
	}

	if filter.MinPrice != nil {
		query = query.Where("\"book\".\"price\" >= ?", *filter.MinPrice)
	}
	if filter.MaxPrice != nil {
		query = query.Where("\"book\".\"price\" <= ?", *filter.MaxPrice)
	}
	if filter.Search != nil {
		term := "%" + *filter.Search + "%"
		query = query.Where("\"book\".\"title\" ILIKE ? OR \"book\".\"description\" ILIKE ?", term, term)
	}
	if filter.InStock != nil && *filter.InStock {
		query = query.Where("\"book\".\"stock\" > 0")
	}

	switch filter.SortBy {
	case "price_asc":
		query = query.OrderExpr("\"book\".\"price\" ASC")
	case "price_desc":
		query = query.OrderExpr("\"book\".\"price\" DESC")
	case "title_asc":
		query = query.OrderExpr("\"book\".\"title\" ASC")
	case "title_desc":
		query = query.OrderExpr("\"book\".\"title\" DESC")
	default:
		query = query.OrderExpr("\"book\".\"created_at\" DESC")
	}

	query = query.Distinct()

	err := query.Scan(ctx)
	return books, err
}

func (r *BookRepository) Update(ctx context.Context, book *models.Book, authorIDs []uuid.UUID, categoryIDs []uuid.UUID) error {
	return r.db.RunInTx(ctx, nil, func(ctx context.Context, tx bun.Tx) error {
		if _, err := tx.NewUpdate().Model(book).WherePK().Exec(ctx); err != nil {
			return fmt.Errorf("failed to update book: %w", err)
		}

		if _, err := tx.NewDelete().Model(&models.BookToAuthor{}).Where("book_id = ?", book.ID).Exec(ctx); err != nil {
			return fmt.Errorf("failed to delete old book-author relations: %w", err)
		}
		if len(authorIDs) > 0 {
			rels := make([]models.BookToAuthor, len(authorIDs))
			for i, aid := range authorIDs {
				rels[i] = models.BookToAuthor{BookID: book.ID, AuthorID: aid}
			}
			if _, err := tx.NewInsert().Model(&rels).Exec(ctx); err != nil {
				return fmt.Errorf("failed to create new book-author relations: %w", err)
			}
		}

		if _, err := tx.NewDelete().Model(&models.BookToCategory{}).Where("book_id = ?", book.ID).Exec(ctx); err != nil {
			return fmt.Errorf("failed to delete old book-category relations: %w", err)
		}
		if len(categoryIDs) > 0 {
			rels := make([]models.BookToCategory, len(categoryIDs))
			for i, cid := range categoryIDs {
				rels[i] = models.BookToCategory{BookID: book.ID, CategoryID: cid}
			}
			if _, err := tx.NewInsert().Model(&rels).Exec(ctx); err != nil {
				return fmt.Errorf("failed to create new book-category relations: %w", err)
			}
		}
		return nil
	})
}

func (r *BookRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.RunInTx(ctx, nil, func(ctx context.Context, tx bun.Tx) error {
		if _, err := tx.NewDelete().Model(&models.BookToAuthor{}).Where("book_id = ?", id).Exec(ctx); err != nil {
			return fmt.Errorf("failed to delete book-author relations: %w", err)
		}
		if _, err := tx.NewDelete().Model(&models.BookToCategory{}).Where("book_id = ?", id).Exec(ctx); err != nil {
			return fmt.Errorf("failed to delete book-category relations: %w", err)
		}
		if _, err := tx.NewDelete().Model(&models.Book{}).Where("id = ?", id).Exec(ctx); err != nil {
			return fmt.Errorf("failed to delete book: %w", err)
		}
		return nil
	})
}
