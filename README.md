# Bookstore Information Management System

### Local checks
Run linter
```shell
cd backend
```
```shell
golangci-lint run
```

Run unit tests
```shell
cd backend
```
```shell
go test ./... -v -race -coverprofile=coverage.out -coverpkg=./handlers/...,./internal/...
```
and check coverage
```shell
go tool cover -func=coverage.out
```

Create new migration
```shell
docker compose up postgres-dev -d
```
```shell
cd backend
```
```shell
atlas migrate diff new_migration --env local 
```

### Local run
```shell
docker compose up
```
Open in browser: http://localhost:5173

Connect to database
```shell
docker compose exec postgres psql -U postgres -d bookstore_info_system
```
or from host
```shell
psql -U postgres -d bookstore_info_system -h localhost -p 6432
```