package DB

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/microsoft/go-mssqldb"
)

func Connectdb() (*sql.DB, error) {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: Error loading .env file, using default or env vars")
	}

	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")

	if host == "" || port == "" || user == "" || password == "" || dbname == "" {
		log.Fatal("Missing one or more required DB environment variables")
	}

	connString := fmt.Sprintf("sqlserver://%s:%s@%s:%s?database=%s&encrypt=disable&connection+timeout=30", user, password, host, port, dbname)
	fmt.Println(">>> Đang kết nối DB với:", connString)

	db, err := sql.Open("sqlserver", connString)
	if err != nil {
		log.Fatalf("Lỗi kết nối DB: %v", err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatalf("Không thể ping DB: %v", err)
	}

	fmt.Println("Kết nối database thành công!")
	return db, nil
}
