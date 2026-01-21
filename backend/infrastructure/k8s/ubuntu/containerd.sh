# Cai pull anh tu registry bang http local node

#Check version
containerd --version

# Cai dat
sudo mkdir -p /etc/containerd/certs.d/192.168.5.202:30000
sudo nano /etc/containerd/certs.d/192.168.5.202:30000/hosts.toml

# hosts.toml
server = "http://192.168.5.202:30000"

[host."http://192.168.5.202:30000"]
  capabilities = ["pull", "resolve", "push"]
  skip_verify = true


# Khôi phục config mặc định
sudo containerd config default | sudo tee /etc/containerd/config.toml


# Sua lai file config
sudo nano /etc/containerd/config.toml

#Check version
containerd --version

# Neu 1x
------------1x------------------------------------------------------------------------------
version = 2

[plugins."io.containerd.grpc.v1.cri".registry]
   config_path = "/etc/containerd/certs.d"

# Neu 2x
-----------2x-------------------------
version = 3

[plugins."io.containerd.cri.v1.images".registry]
   config_path = "/etc/containerd/certs.d"
---------------------------------------------------------------------------------------------

# Configure Docker Daemon for Insecure Registry
sudo nano /etc/docker/daemon.json

{
  "insecure-registries": ["192.168.5.202:30000"]
}
sudo systemctl restart docker
sudo systemctl status docker

sudo systemctl restart containerd
sudo systemctl status containerd


# Xoa
sudo rm -rf /etc/containerd/certs.d/192.168.5.202:30000