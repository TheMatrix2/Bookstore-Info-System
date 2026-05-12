package dto

import "github.com/google/uuid"

type BookInput struct {
	Title       string      `json:"title"`
	Description *string     `json:"description"`
	Price       float64     `json:"price"`
	Stock       int         `json:"stock"`
	AuthorIDs   []uuid.UUID `json:"author_ids"`
	PublisherID uuid.UUID   `json:"publisher_id"`
	CategoryIDs []uuid.UUID `json:"category_ids"`
}

// BookFilter supports advanced filtering; all fields are optional.
// Array fields (AuthorIDs, CategoryIDs) are passed as a single comma-separated param:
//   ?author_ids=uuid1,uuid2&category_ids=uuid3,uuid4
// SortBy accepted values: price_asc, price_desc, title_asc, title_desc, newest
type BookFilter struct {
	AuthorIDs   string   `form:"author_ids"`
	CategoryIDs string   `form:"category_ids"`
	PublisherID *string  `form:"publisher_id"`
	MinPrice    *float64 `form:"min_price"`
	MaxPrice    *float64 `form:"max_price"`
	Search      *string  `form:"search"`
	InStock     *bool    `form:"in_stock"`
	SortBy      string   `form:"sort_by"`
}
