package docker

func TempDockerPython() string {
	return `
FROM 192.168.5.202:30000/python:3.12

WORKDIR /app
COPY . .

# Cài dependencies nếu có requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000
CMD ["python", "app.py"]
`
}
