var Client = require('node-rest-client').Client;
var moment = require('moment');

module.exports = {
    client: new Client(),
    instances: {},
    options: {
        registration_interval: 5000,
        registration_url: 'http://localhost:8080/api/instances'
    },
    register_args: {
        data: {
            species: process.env.SERVICE_SPECIES,
            hostname: process.env.SERVICE_HOSTNAME,
            port: process.env.PORT || 3000,
            version: process.env.SERVICE_VERSION
        },
        headers: {
            "Content-Type": "application/json"
        }
    },
    checkin_interval: {},
    initialize: function(instances, options) {
        this.instances = instances;
        if (typeof(options) == 'object') {
            for (var key in options) {
                this.options[key] = options[key];
            }
        }
        this.checkin_interval = setInterval(this.checkin.bind(this), this.options.registration_interval);

    },

    checkin: function() {
        this.client.post(this.options.registration_url, this.register_args, function(data, response) {
        });

        this.client.get(this.options.registration_url, this.parse_eureka_reply.bind(this));
    },

    parse_eureka_reply: function(data, response) {
        var serviceName;
        var hosts;
        var version;
        var hostname;

        if (response.statusCode == 200) {
            for (var service_index in data.applications.application) {
                serviceName = data.applications.application[service_index].name.toLowerCase();
                hosts = data.applications.application[service_index].instance;
                if (!Array.isArray(hosts)) {
                    hosts = [ hosts ];
                    // console.log(hosts);
                }
                
                for (var host in hosts) {
                    if (hosts[host].metadata.version) {
                        this.instances[serviceName] = this.instances[serviceName] || {};
                        version = hosts[host].metadata.version;
                        hostname = hosts[host].hostName;
                        this.instances[serviceName][version] = this.instances[serviceName][version] || {};
                        this.instances[serviceName][version][hostname] = {
                            hostname: hostname,
                            port: hosts[host].port["$"],
                            version: version,
                            timestamp: moment(hosts[host].leaseInfo.lastRenewalTimestamp),
                            address: hosts[host].ipAddr
                        };
                    } else {
                    }
                }
            }
            // console.log(JSON.stringify(this.instances));
        } else {
            throw new Error(data);
        }
    }
}