package k8smanager

func getDatabaseImage(dbType string) string {
	switch dbType {
	case "mssql":
		return "192.168.5.202:30000/server/mssql:2019-latest"
	case "mysql":
		return "192.168.5.202:30000/mysql:8.0"
	case "mongodb":
		return "192.168.5.202:30000/mongo:5.0"
	case "minio":
		return "192.168.5.202:30000/minio/minio:latest"
	case "postgresql":
		return "192.168.5.202:30000/postgres:13"
	case "redis":
		return "192.168.5.202:30000/redis:6.2-alpine"
	default:
		return "192.168.5.202:30000/mysql:8.0"
	}
}

func getDatabaseUsername(dbType string) string {
	switch dbType {
	case "mssql":
		return "sa"
	case "mysql":
		return "root"
	case "mongodb":
		return "root"
	case "minio":
		return "minioadmin"
	case "postgresql":
		return "postgres"
	case "redis":
		return "" // Redis không có username
	default:
		return "admin"
	}
}

func getDatabasePort(dbType string) int {
	switch dbType {
	case "mssql":
		return 1433
	case "mysql":
		return 3306
	case "mongodb":
		return 27017
	case "minio":
		return 9000
	case "postgresql":
		return 5432
	case "redis":
		return 6379
	default:
		return 3306
	}
}

func getDatabaseStorageSize(dbType string) string {
	switch dbType {
	case "mssql":
		return "1Gi"
	case "mysql":
		return "1Gi"
	case "mongodb":
		return "1Gi"
	case "minio":
		return "1Gi"
	case "postgresql":
		return "1Gi"
	case "redis":
		return "1Gi"
	default:
		return "1Gi"
	}
}
