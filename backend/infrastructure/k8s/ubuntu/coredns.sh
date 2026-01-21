#8.8.8.8.8 1.1.1.1 tao ket noi internet tu pod ra 
#cấu hình để Pod có thể phân giải DNS ra Internet
kubectl get configmap coredns -n kube-system -o yaml > coredns.yaml
kubectl rollout restart deployment coredns -n kube-system
