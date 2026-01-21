# Kiểm tra ingress controller đã chạy chưa
kubectl get pods -n ingress-nginx
# Nếu chưa có, cài đặt ingress controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/baremetal/deploy.yaml

