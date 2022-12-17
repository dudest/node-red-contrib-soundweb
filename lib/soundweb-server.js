var net = require('net');

module.exports = function(RED) {
    "use strict";
    
    function SoundwebServerNode(n) {
        RED.nodes.createNode(this,n);

        var host = n.host;
        var port = n.port;
        var server_id = '[soundweb-' + host + ':' + port + ']'
        
        this.socket = net.connect(port, host);

        /****************************************************
         * Helper functions
         ****************************************************/

        this.encapsulateCommand = function (cmd_id, address, data) {
            var cmd = Buffer.concat([cmd_id, address, data]);
            var checksum = 0;
            for (let i = 0; i < cmd.length; i++) {
                checksum = checksum ^ parseInt(cmd[i]);
            }
            cmd = Buffer.concat([Buffer.from([2]), cmd, Buffer.from([checksum, 3])]);
            return cmd;
        }

        /****************************************************
         * TCP Socket Event Handlers
         ****************************************************/

        this.socket.on('error', function(ex) {
            console.log("error");
            console.log(ex);
        });

        // connect
        this.socket.on('connect', function() {
            console.log(server_id + ' connected');
        });

        // ready
        this.socket.on('ready', function() {
            console.log(server_id + ' ready');
        });

        // close
        this.socket.on('close', function() {
            console.log(server_id + ' connection closed');
        });

        // data
        this.socket.on('data', function(data) {
            console.log(server_id + ' ' + data);
        });
    }
    RED.nodes.registerType("soundweb-server", SoundwebServerNode);
}