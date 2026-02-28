package main

import (
	"log"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/handlers"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/db"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/services"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/middleware"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/repository"
	"github.com/gin-gonic/gin"
)

func main() {
    database, err := db.New()
    if err != nil {
        log.Fatalf("failed to connect to db: %v", err)
    }
    defer func() {
        if err := database.Close(); err != nil {
            log.Printf("failed to close db: %v", err)
        }
    }()

    // Dependency injection
    userRepo    := repository.NewUserRepository(database)
    authService := services.NewAuthService(userRepo)
    authHandler := handlers.NewAuthHandler(authService)

    router := gin.Default()

    // Публичные роуты
    public := router.Group("/api/v1")
    {
        public.POST("/auth/register", authHandler.Register)
        public.POST("/auth/login",    authHandler.Login)
    }

    // Защищённые роуты
    private := router.Group("/api/v1")
    private.Use(middleware.AuthMiddleware())
    {
        // private.GET("/profile", profileHandler.Get)
    }

    if err := router.Run(":8080"); err != nil {
        log.Fatal(err)
    }
}