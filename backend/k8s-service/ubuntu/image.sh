# O day minh se pull anh tu docker hub ve bang docker ClI va push no len  pod registry noi bo 
# Push ảnh kaniko
sudo docker pull gcr.io/kaniko-project/executor:latest
sudo docker tag gcr.io/kaniko-project/executor:latest 192.168.5.202:30000/kaniko-project/executor:latest
sudo docker push 192.168.5.202:30000/kaniko-project/executor:latest
# Push anh golang
sudo docker pull golang:1.23
sudo docker tag golang:1.23 192.168.5.202:30000/golang:1.23
sudo docker push 192.168.5.202:30000/golang:1.23
# Push anh aplpine/git 
sudo docker pull alpine/git:latest
sudo docker tag alpine/git:latest 192.168.5.202:30000/alpine/git:latest
sudo docker push 192.168.5.202:30000/alpine/git:latest

# Push anh mysql 
sudo docker pull mysql:8.0
sudo docker tag mysql:8.0 192.168.5.202:30000/mysql:8.0
sudo docker push 192.168.5.202:30000/mysql:8.0


# Push anh minio
sudo docker pull minio/minio:latest
sudo docker tag minio/minio:latest 192.168.5.202:30000/minio/minio:latest
sudo docker push 192.168.5.202:30000/minio/minio:latest

# Push anh alpine:3.20
sudo docker pull alpine:3.20
sudo docker tag alpine:3.20 192.168.5.202:30000/alpine:3.20
sudo docker push 192.168.5.202:30000/alpine:3.20

# Kiem tra anh
curl http://192.168.5.202:30000/v2/_catalog
# Kiem tra tag cua anh
curl http://192.168.5.200:32000/v2/<tên-repo>/tags/list