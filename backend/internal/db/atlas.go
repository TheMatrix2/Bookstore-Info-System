//go:build ignore

package main

import (
	"fmt"
	"os"

	"ariga.io/atlas-provider-bun/bunschema"

	"github.com/TheMatrix2/Bookstore-Info-System/backend/internal/models"
)

func main() {
	stmts, err := bunschema.New(bunschema.DialectPostgres).Load(
		&models.Role{},
		&models.Author{},
		&models.Publisher{},
		&models.Category{},
		&models.User{},
		&models.Book{},
		&models.BookToCategory{},
		&models.Cart{},
		&models.CartItem{},
		&models.Order{},
		&models.OrderItem{},
		&models.Payment{},
		&models.Delivery{},
	)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to load schema: %v\n", err)
		os.Exit(1)
	}
	fmt.Print(stmts)
}