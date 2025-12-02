#lay file config kubeadm de ket noi remote
sudo cat /etc/kubernetes/admin.conf
#tao lai token join
kubeadm token create --print-join-command
#Kiểm tra ảnh trong pod:
kubectl get pods --all-namespaces -o jsonpath="{..image}" | tr -s '[[:space:]]' '\n' | sort | uniq

#EXTERNAL-IP: 192.x.x.x.
#Cập nhật hosts trên client<tren may ket noi remote>:
192.168.5.201  idinwebsite-test-app.abcd.local
#Mở Chrome truy cập:
http://idinwebsite-test-app.abcd.local


#Qua trinh loi khi deploy 
kubectl delete all --all -n use --force --grace-period=0
kubectl get pod -A
kubectl get deployment -A
kubectl get ingress -A
kubectl get svc -A

k9s --kubeconfig D:\go\bncloud\k8s\config.yaml


sudo ip link set ens33 up

sudo dhclient ens33

sudo systemctl restart kubelet