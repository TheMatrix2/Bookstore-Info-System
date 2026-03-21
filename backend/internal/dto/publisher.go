package dto

type PublisherInput struct {
	Name    	string  `json:"name" validate:"required,min=2,max=50"`
	Address    	string  `json:"address" validate:"required,min=10,max=100"`
}