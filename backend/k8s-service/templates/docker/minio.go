package docker

import "fmt"

func TempDockerMinIO(pass string) string {
	return fmt.Sprintf(`
FROM 192.168.5.202:30000/minio/minio:latest

ENV MINIO_ROOT_USER=root
ENV MINIO_ROOT_PASSWORD=%s

EXPOSE 9000
EXPOSE 9001

CMD ["server", "/data", "--console-address", ":9001"]
`, pass)
}
