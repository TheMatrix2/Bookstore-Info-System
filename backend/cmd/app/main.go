package main

import (
	"log"
	"os"
	"strconv"

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

    // read config from env
    jwtSecret := os.Getenv("JWT_SECRET")
    jwtExpiration, err := strconv.Atoi(os.Getenv("JWT_EXPIRATION"))
    if err != nil {
        log.Fatalf("failed to parse JWT expiration: %v", err)
    }

    // Dependency injection
    // repositories
    userRepo    := repository.NewUserRepository(database)

    // services
    jwtService := services.NewJWTService(jwtSecret, jwtExpiration)
    authService := services.NewAuthService(userRepo, jwtService)
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

    // private routes
    private := router.Group("/api/v1")
    private.Use(middleware.AuthMiddleware(jwtService))
    {
        private.GET("/profile", userHandler.GetByID)
        private.PUT("/users/:id", userHandler.Update)
    }

    // private routes for employees
    employee := router.Group("/api/v1")
    employee.Use(middleware.AuthMiddleware(jwtService), middleware.RequireRoles(&repository.EMPLOYEE_ROLES))
    {
        employee.GET("/users/customers", userHandler.GetAllCustomers)
        employee.GET("/users/employees", userHandler.GetAllEmployees)
        employee.DELETE("/users/:id", userHandler.Delete)
    }

    if err := router.Run(":8080"); err != nil {
        log.Fatal(err)
    }
}