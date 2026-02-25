# Bookstore-Info-System

Run linter locally
```shell
golangci-lint run
```

Make migration locally
```shell
atlas migrate diff new_migration --env local 
```

Connect to database after ```docker compose up```
```shell
docker compose exec postgres psql -U postgres -d bookstore_info_system
```

or from host
```shell
psql -U postgres -d bookstore_info_system -h localhost -p 6432
```