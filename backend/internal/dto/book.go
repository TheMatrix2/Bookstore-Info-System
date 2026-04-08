package dto

import "github.com/google/uuid"

type BookInput struct {
	Title		string		`json:"title"`
	Description	*string		`json:"description"`
	Price		float64		`json:"price"`
	Stock		int			`json:"stock"`
	AuthorID	uuid.UUID	`json:"author_id"`
	PublisherID uuid.UUID	`json:"publisher_id"`
	CategoryIDs []uuid.UUID `json:"category_ids"`
}

type BookFilter struct {
	AuthorID	*uuid.UUID	`form:"author_id"`
	CategoryID	*uuid.UUID	`form:"category_id"`
	MinPrice	*float64	`form:"min_price"`
	MaxPrice	*float64	`form:"max_price"`
	Search		*string		`form:"search"`
}