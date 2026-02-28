package db

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/lib/pq"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
)

func New() (*bun.DB, error) {
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		return nil, fmt.Errorf("DB_DSN environment variable is not set")
	}

	sqldb, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := sqldb.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return bun.NewDB(sqldb, pgdialect.New()), nil
}
