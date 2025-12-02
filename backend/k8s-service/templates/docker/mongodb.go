package docker

import "fmt"

func TempDockerMongoDB(rootPassword string) string {
	return fmt.Sprintf(`
FROM 192.168.5.202:30000/mongo:6.0

ENV MONGO_INITDB_ROOT_USERNAME=root
ENV MONGO_INITDB_ROOT_PASSWORD=%s

EXPOSE 27017

CMD ["mongod"]
`, rootPassword)
}
