# Cài MetalLB
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.13.12/config/manifests/metallb-native.yaml
# Đợi 1 phút
sleep 60
#  Cấu hình IP pool - DÙNG CHÍNH IP MASTER NODE
kubectl apply -f - <<EOF
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: default-pool
  namespace: metallb-system
spec:
  addresses:
  - 192.168.5.201-192.168.5.204
EOF

kubectl apply -f - <<EOF
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: default
  namespace: metallb-system
EOF

# Sửa ingress service
kubectl patch svc ingress-nginx-controller -n ingress-nginx -p '{"spec": {"type": "LoadBalancer"}}'

# Chờ 30s và kiểm tra
sleep 30
kubectl get svc -n ingress-nginx

#Cách làm nhanh trên cluster hiện tại

#Xóa Service cũ để không còn NodePort nữa:
kubectl delete svc ingress-nginx-controller -n ingress-nginx
#Tạo lại Service LoadBalancer chuẩn:
kubectl apply -f - <<EOF
apiVersion: v1
kind: Service
metadata:
  name: ingress-nginx-controller
  namespace: ingress-nginx
spec:
  type: LoadBalancer
  allocateLoadBalancerNodePorts: false
  selector:
    app.kubernetes.io/name: ingress-nginx
    app.kubernetes.io/component: controller
  ports:
    - name: http
      port: 80
      targetPort: http
    - name: https
      port: 443
      targetPort: https
EOF


#Chờ va checK:
kubectl get svc -n ingress-nginx