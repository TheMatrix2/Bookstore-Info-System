package dto

type AuthorInput struct {
	Surname    	string  `json:"surname" validate:"required,min=2,max=50"`
	Name       	string  `json:"name" validate:"required,min=2,max=50"`
	Patronymic 	string  `json:"patronymic" validate:"required,min=2,max=50"`
	Info	   	*string `json:"info,omitempty"`
}