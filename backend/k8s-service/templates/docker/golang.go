package docker

func TempDockerGoLang() string {
	return `
FROM 192.168.5.202:30000/golang:1.23 AS builder


# Kiểm tra version Go
RUN go version

WORKDIR /app

# Copy go.mod và go.sum trước để tận dụng cache layer  
COPY go.mod go.sum ./
RUN go mod download

# Copy toàn bộ source code
COPY . .

# Build binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o myapp .

FROM 192.168.5.202:30000/alpine:3.20
WORKDIR /app
COPY --from=builder /app/myapp .
EXPOSE 8080
CMD ["./myapp"]`
}
