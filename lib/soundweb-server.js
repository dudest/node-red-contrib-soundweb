var net = require('net');
var bssLib = require('./bss_lib');

module.exports = function(RED) {
    "use strict";
    
    function SoundwebServerNode(n) {
        RED.nodes.createNode(this,n);

        let host = n.host;
        let port = n.port;
        let node = this;
        
        this.socket = net.connect(port, host);
        this.bssLib = bssLib;

        this.socket.on('data', function(data) {
            let rx = node.bssLib.decapsulateCommand(data);

            if (rx) {
                let temp = {
                    cmd_id: "",
                    address: "",
                    data: ""
                }
                temp.cmd_id = node.bssLib.getCommandIdBuffer(rx);
                temp.address = node.bssLib.getAddressBuffer(rx);
                temp.data = node.bssLib.getDataBuffer(rx);
                node.emit('rxData', temp);
            }
        });
    }
    RED.nodes.registerType("soundweb-server", SoundwebServerNode);
}