package docker

import "fmt"

// TempDockerMSSQL tạo Dockerfile MSSQL với mật khẩu SA truyền vào
func TempDockerMSSQL(pass string) string {
	return fmt.Sprintf(`
FROM 192.168.5.202:30000/mssql/server:2022-latest

ENV ACCEPT_EULA=Y
ENV SA_PASSWORD=%s
ENV MSSQL_PID=Developer
ENV MSSQL_TCP_PORT=1433

# Copy script cấu hình
COPY configure.sh /configure.sh
RUN chmod +x /configure.sh

CMD ["/bin/bash", "-c", "/configure.sh & /opt/mssql/bin/sqlservr"]
`, pass)
}
