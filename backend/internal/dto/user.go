package dto

type UpdateUserRequest struct {
    Username string  `json:"username" validate:"required,min=3,max=50"`
    Email    string  `json:"email"    validate:"required,email"`
    Phone    *string `json:"phone,omitempty" validate:"e164"`
}

type RegisterRequest struct {
    Username string  `json:"username" validate:"required,min=3,max=50"`
    Email    string  `json:"email"    validate:"required,email"`
    Phone    *string `json:"phone,omitempty" validate:"e164"`
    Password string  `json:"password" validate:"required,min=6"`
}

type LoginRequest struct {
    Email    string `json:"email"    validate:"required,email"`
    Password string `json:"password" validate:"required"`
}

type AuthResponse struct {
    Token string `json:"token"`
}