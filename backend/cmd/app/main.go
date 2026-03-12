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
    // repositories
    userRepo    := repository.NewUserRepository(database)

    // services
    authService := services.NewAuthService(userRepo)
    userService := services.NewUserService(userRepo)

    // handlers
    authHandler := handlers.NewAuthHandler(authService)
    userHandler := handlers.NewUserHandler(userService)

    router := gin.Default()

    // public routes
    public := router.Group("/api/v1")
    {
        public.POST("/auth/register", authHandler.Register)
        public.POST("/auth/login",    authHandler.Login)
    }

    // private routes for customers
    private := router.Group("/api/v1")
    private.Use(middleware.AuthMiddleware(), middleware.RequireRoles(&[]string{repository.CUSTOMER_ROLE}))
    {
        private.GET("/profile", userHandler.GetByID)
        private.PUT("/users/:id", userHandler.Update)

    }

    // private routes for employees
    employee := router.Group("/api/v1")
    employee.Use(middleware.AuthMiddleware(), middleware.RequireRoles(&repository.EMPLOYEE_ROLES))
    {
        employee.GET("/users/customers", userHandler.GetAllCustomers)
        employee.GET("/users/employees", userHandler.GetAllEmployees)
        employee.GET("/profile", userHandler.GetByID)
        employee.PUT("/users/:id", userHandler.Update)
        employee.DELETE("/users/:id", userHandler.Delete)
    }

    if err := router.Run(":8080"); err != nil {
        log.Fatal(err)
    }
}