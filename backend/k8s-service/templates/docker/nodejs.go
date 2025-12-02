package docker

func TempDockerNode() string {
	return `
FROM 192.168.5.202:30000/node:20

WORKDIR /app
COPY . .

# Cài dependencies
RUN npm install --production

EXPOSE 3000
CMD ["node", "index.js"]
`
}
