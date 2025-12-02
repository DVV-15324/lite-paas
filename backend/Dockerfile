# Stage 1: Build
FROM golang:1.23-alpine AS builder

# Cài công cụ build
RUN apk add --no-cache git ca-certificates

WORKDIR /app

# Copy module files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build binary với flags tối ưu
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags='-w -s' -a -installsuffix cgo -o app .

# Runtime (image cuối cùng nhẹ hơn nhiều)
FROM alpine:latest

# Cài CA certificates và thư viện cần thiết
RUN apk --no-cache add ca-certificates tzdata

# Tạo non-root user để chạy app (tăng bảo mật)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy binary từ stage builder
COPY --from=builder /app/app .
COPY --from=builder /app/.env ./.env
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Chuyển quyền sở hữu cho non-root user
RUN chown -R appuser:appgroup /app

# Chuyển sang non-root user
USER appuser

EXPOSE 3000

CMD ["./app"]