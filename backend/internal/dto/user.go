package dto

type UpdateUserRequest struct {
    Username string  `json:"username"`
    Email    string  `json:"email" validate:"email"`
    Phone    *string `json:"phone" validate:"e164"`
}

type RegisterRequest struct {
    Username string  `json:"username"`
    Email    string  `json:"email" validate:"email"`
    Phone    *string `json:"phone" validate:"e164"`
    Password string  `json:"password"`
}

type LoginRequest struct {
    Email    string `json:"email"`
    Password string `json:"password"`
}

type AuthResponse struct {
    Token string `json:"token"`
}