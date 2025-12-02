package docker

import "fmt"

func TempDockerMySQL(rootPassword string) string {
	return fmt.Sprintf(`
FROM 192.168.5.202:30000/mysql:8.0


ENV MYSQL_ROOT_PASSWORD=%s


EXPOSE 3306


CMD ["mysqld"]
`, rootPassword)
}
