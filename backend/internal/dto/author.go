package dto

type AuthorInput struct {
	Surname    	string  `json:"surname"`
	Name       	string  `json:"name"`
	Patronymic 	string  `json:"patronymic"`
	Info	   	*string `json:"info"`
}