FROM 192.168.5.202:30000/golang:1.23 AS builder\nWORKDIR /app\nCOPY go.mod go.sum ./\nRUN go mod download\nCOPY . .\nRUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o myapp .\n\nFROM 192.168.5.202:30000/alpine:3.20\nWORKDIR /app\nCOPY --from=builder /app/myapp .\nEXPOSE 8080\nCMD ["./myapp"]`

