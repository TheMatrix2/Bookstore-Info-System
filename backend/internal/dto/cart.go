package dto

type CartItemCreateInput struct {
	BookID  string `json:"book_id" validate:"required"`
	Quantity int    `json:"quantity" validate:"required,min=1"`
}

type CartItemUpdateInput struct {
	Quantity int `json:"quantity" validate:"required,min=1"`
}