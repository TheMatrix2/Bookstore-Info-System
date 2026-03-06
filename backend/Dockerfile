# ---------- build stage ----------
FROM golang:1.24.11 AS builder

WORKDIR /app

RUN curl -sSf https://atlasgo.sh | sh

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -o app ./cmd/app

# ---------- migration stage ---------
FROM gcr.io/distroless/base-debian12 AS migrator

WORKDIR /app
COPY --from=builder /usr/local/bin/atlas /usr/local/bin/atlas
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/atlas.hcl ./atlas.hcl

ENTRYPOINT ["atlas", "migrate", "apply", "--env", "local"]

# ---------- runtime stage ----------
FROM gcr.io/distroless/base-debian12

WORKDIR /app
COPY --from=builder /app/app /app/app

EXPOSE 8080
ENTRYPOINT ["/app/app"]