# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"
NODE_NAME     = "hydra.vagrant"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

  config.vm.box = "ubuntu/trusty64"

  config.vm.define 'hydra' do |hydra| 
    hydra.vm.hostname = NODE_NAME
    hydra.vm.network "private_network", ip: "33.33.44.70"

    hydra.vm.provider :virtualbox do |vb|
      vb.gui = false
      vb.customize ['modifyvm', :id, '--memory', '4096']
      vb.customize ['modifyvm', :id, '--name',   NODE_NAME ]
    end

    #==================
    #------------------
    hydra.vm.provision "shell", path: "scripts/archive_vm.sh"

    hydra.vm.provision "ansible" do |ansible| 
      ansible.playbook = "playbooks/vagrant.yml"
      ansible.verbose  = "vv" 
      ansible.tags     = "vagrant"
    end
  end

end
