#lay file config kubeadm de ket noi remote
sudo cat /etc/kubernetes/admin.conf
#tao lai token join
kubeadm token create --print-join-command

#Qua trinh loi khi deploy 
kubectl delete all --all -n use --force --grace-period=0
kubectl get pod -A
kubectl get deployment -A
kubectl get ingress -A
kubectl get svc -A

sudo ip link set ens33 up

sudo dhclient ens33

sudo systemctl restart kubelet