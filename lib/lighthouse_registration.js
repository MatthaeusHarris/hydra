module.exports = function(instances) {
    var Client = require('node-rest-client').Client;

    var client = new Client();

    var register_args = {
        data: {
            species: process.env.SERVICE_SPECIES,
            hostname: process.env.SERVICE_HOSTNAME,
            port: process.env.PORT || 3000,
            version: process.env.SERVICE_VERSION
        },
        headers: {
            "Content-Type": "application/json"
        }
    }

    setInterval(function() {
        client.post("http://localhost:8080/api/instances", register_args, function(data, response) {
        });

        client.get("http://localhost:8080/api/instances", function(data, response) {
            for (var service in data) {
                instances[service] = data[service];
            }
            // console.log(instances);
        })
    }, 5 * 1000);

}

