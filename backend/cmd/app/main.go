package main

import (
	"os"
	"strconv"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/handlers"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/db"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/logger"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/services"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/middleware"
	"github.com/TheMatrix2/Bookstore-Info-System/backend/repository"
	"github.com/gin-gonic/gin"
)

func main() {
	log := logger.New()

	database, err := db.New()
	if err != nil {
		log.Error("failed to connect to db", "error", err)
		return
	}
	defer func() {
		if err := database.Close(); err != nil {
			log.Error("failed to close db", "error", err)
		}
	}()

	jwtSecret := os.Getenv("JWT_SECRET")
	jwtExpiration, err := strconv.Atoi(os.Getenv("JWT_EXPIRATION"))
	if err != nil {
		log.Error("failed to parse JWT expiration", "error", err)
		return
	}

	// repositories
	userRepo        := repository.NewUserRepository(database)
	authorRepo      := repository.NewAuthorRepository(database)
	publisherRepo   := repository.NewPublisherRepository(database)
	categoryRepo    := repository.NewCategoryRepository(database)
	bookRepo        := repository.NewBookRepository(database)
	cartRepo        := repository.NewCartRepository(database)
	orderRepo       := repository.NewOrderRepository(database)
	paymentRepo     := repository.NewPaymentRepository(database)
	deliveryRepo    := repository.NewDeliveryRepository(database)

	// services
	jwtService       := services.NewJWTService(jwtSecret, jwtExpiration)
	authService      := services.NewAuthService(userRepo, jwtService)
	userService      := services.NewUserService(userRepo)
	authorService    := services.NewAuthorService(authorRepo)
	publisherService := services.NewPublisherService(publisherRepo)
	categoryService  := services.NewCategoryService(categoryRepo)
	bookService      := services.NewBookService(bookRepo)
	cartService      := services.NewCartService(cartRepo)
	orderService     := services.NewOrderService(orderRepo, cartRepo)
	paymentService   := services.NewPaymentService(paymentRepo, orderRepo)
	deliveryService  := services.NewDeliveryService(deliveryRepo, orderRepo)

	// handlers
	authHandler     := handlers.NewAuthHandler(authService)
	userHandler     := handlers.NewUserHandler(userService)
	authorHandler   := handlers.NewAuthorHandler(authorService)
	publisherHandler := handlers.NewPublisherHandler(publisherService)
	categoryHandler  := handlers.NewCategoryHandler(categoryService)
	bookHandler      := handlers.NewBookHandler(bookService)
	cartHandler      := handlers.NewCartHandler(cartService)
	orderHandler     := handlers.NewOrderHandler(orderService)
	paymentHandler   := handlers.NewPaymentHandler(paymentService)
	deliveryHandler  := handlers.NewDeliveryHandler(deliveryService)

	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(middleware.Logger(log))

	// CORS middleware
	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// public routes
	public := router.Group("/api/v1")
	{
		public.POST("/auth/register",  authHandler.Register)
		public.POST("/auth/login",     authHandler.Login)
		public.GET("/authors/:id",     authorHandler.GetByID)
		public.GET("/authors",         authorHandler.GetAll)
		public.GET("/publishers/:id",  publisherHandler.GetByID)
		public.GET("/publishers",      publisherHandler.GetAll)
		public.GET("/categories/:id",  categoryHandler.GetByID)
		public.GET("/categories",      categoryHandler.GetAll)
		public.GET("/books/:id",       bookHandler.GetByID)
		public.GET("/books",           bookHandler.GetAll)
	}

	// private routes (authenticated users)
	private := router.Group("/api/v1")
	private.Use(middleware.AuthMiddleware(jwtService))
	{
		private.GET("/users/:id",                 userHandler.GetProfile)
		private.PUT("/users/:id",                 userHandler.Update)

		private.GET("/cart",                      cartHandler.GetCart)
		private.POST("/cart/items",               cartHandler.AddItem)
		private.PUT("/cart/items/:book_id",       cartHandler.UpdateItem)
		private.DELETE("/cart/items/:book_id",    cartHandler.RemoveItem)
		private.DELETE("/cart",                   cartHandler.ClearCart)

		private.POST("/orders",                   orderHandler.Create)
		private.GET("/orders",                    orderHandler.GetUserOrders)
		private.GET("/orders/:id",                orderHandler.GetByID)

		private.POST("/orders/:id/payment", paymentHandler.Create)
		private.GET("/orders/:id/payment",  paymentHandler.GetByOrderID)

		private.POST("/orders/:id/delivery", deliveryHandler.Create)
		private.GET("/orders/:id/delivery",  deliveryHandler.GetByOrderID)
	}

	// employee routes
	employee := router.Group("/api/v1")
	employee.Use(middleware.AuthMiddleware(jwtService), middleware.RequireRoles(&repository.EMPLOYEE_ROLES))
	{
		employee.GET("/users/customers",              userHandler.GetAllCustomers)
		employee.GET("/users/employees",              userHandler.GetAllEmployees)
		employee.DELETE("/users/:id",                 userHandler.Delete)

		employee.POST("/authors",                     authorHandler.Create)
		employee.PUT("/authors/:id",                  authorHandler.Update)
		employee.DELETE("/authors/:id",               authorHandler.Delete)

		employee.POST("/publishers",                  publisherHandler.Create)
		employee.PUT("/publishers/:id",               publisherHandler.Update)
		employee.DELETE("/publishers/:id",            publisherHandler.Delete)

		employee.POST("/categories",                  categoryHandler.Create)
		employee.PUT("/categories/:id",               categoryHandler.Update)
		employee.DELETE("/categories/:id",            categoryHandler.Delete)

		employee.POST("/books",                       bookHandler.Create)
		employee.PUT("/books/:id",                    bookHandler.Update)
		employee.DELETE("/books/:id",                 bookHandler.Delete)

		employee.GET("/admin/orders",                 orderHandler.GetAll)
		employee.PUT("/admin/orders/:id/status",      orderHandler.UpdateStatus)
		employee.PUT("/admin/payments/:id/status",    paymentHandler.UpdateStatus)
		employee.PUT("/admin/deliveries/:id/status", deliveryHandler.UpdateStatus)
	}

	if err := router.Run(":8080"); err != nil {
		log.Error("server failed", "error", err)
	}
}
