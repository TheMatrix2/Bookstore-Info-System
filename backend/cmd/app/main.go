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
    userRepo            := repository.NewUserRepository(database)
    authorRepo          := repository.NewAuthorRepository(database)
    publisherRepo       := repository.NewPublisherRepository(database)
    categoryRepo        := repository.NewCategoryRepository(database)
    bookRepo            := repository.NewBookRepository(database)

    // services
    jwtService          := services.NewJWTService(jwtSecret, jwtExpiration)
    authService         := services.NewAuthService(userRepo, jwtService)
    userService         := services.NewUserService(userRepo)
    authorService       := services.NewAuthorService(authorRepo)
    publisherService    := services.NewPublisherService(publisherRepo)
    categoryService     := services.NewCategoryService(categoryRepo)
    bookService         := services.NewBookService(bookRepo)

    // handlers
    authHandler         := handlers.NewAuthHandler(authService)
    userHandler         := handlers.NewUserHandler(userService)
    authorHandler       := handlers.NewAuthorHandler(authorService)
    publisherHandler    := handlers.NewPublisherHandler(publisherService)
    categoryHandler     := handlers.NewCategoryHandler(categoryService)
    bookHandler         := handlers.NewBookHandler(bookService)

    router := gin.Default()

    // public routes
    public := router.Group("/api/v1")
    {
        public.POST("/auth/register",   authHandler.Register)
        public.POST("/auth/login",      authHandler.Login)
        public.GET("/authors/:id",      authorHandler.GetByID)
        public.GET("/authors",          authorHandler.GetAll)
        public.GET("/publishers/:id",   publisherHandler.GetByID)
        public.GET("/publishers",       publisherHandler.GetAll)
        public.GET("/categories/:id",   categoryHandler.GetByID)
        public.GET("/categories",       categoryHandler.GetAll)
        public.GET("/books/:id",        bookHandler.GetByID)
        public.GET("/books",            bookHandler.GetAll)

    }

    // private routes
    private := router.Group("/api/v1")
    private.Use(middleware.AuthMiddleware(jwtService))
    {
        private.GET("/profile",     userHandler.GetProfile)
        private.PUT("/users/:id",   userHandler.Update)
    }

    // private routes for employees
    employee := router.Group("/api/v1")
    employee.Use(middleware.AuthMiddleware(jwtService), middleware.RequireRoles(&repository.EMPLOYEE_ROLES))
    {
        employee.GET("/users/customers",    userHandler.GetAllCustomers)
        employee.GET("/users/employees",    userHandler.GetAllEmployees)
        employee.DELETE("/users/:id",       userHandler.Delete)
        employee.POST("/authors",           authorHandler.Create)
        employee.PUT("/authors/:id",        authorHandler.Update)
        employee.DELETE("/authors/:id",     authorHandler.Delete)
        employee.POST("/publishers",        publisherHandler.Create)
        employee.PUT("/publishers/:id",     publisherHandler.Update)
        employee.DELETE("/publishers/:id",  publisherHandler.Delete)
        employee.POST("/categories",        categoryHandler.Create)
        employee.PUT("/categories/:id",     categoryHandler.Update)
        employee.DELETE("/categories/:id",  categoryHandler.Delete)
        employee.POST("/books",             bookHandler.Create)
        employee.PUT("/books/:id",          bookHandler.Update)
        employee.DELETE("/books/:id",       bookHandler.Delete)
    }

    if err := router.Run(":8080"); err != nil {
        log.Fatal(err)
    }
}