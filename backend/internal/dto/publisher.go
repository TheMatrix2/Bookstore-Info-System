package dto

type PublisherInput struct {
	Name    		string  `json:"name"`
	Address    		string  `json:"address"`
	Email      		string  `json:"email"`
	Website    		*string `json:"website"`
}