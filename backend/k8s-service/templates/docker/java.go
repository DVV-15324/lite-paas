package docker

func TempDockerJava() string {
	return `
FROM 192.168.5.202:30000/openjdk:22-jdk AS builder

WORKDIR /app
COPY . .
RUN ./mvnw clean package -DskipTests

FROM 192.168.5.202:30000/openjdk:22-jre
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
`
}
