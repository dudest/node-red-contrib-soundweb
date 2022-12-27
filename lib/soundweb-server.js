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
            let rxBuf = [];

            for (let i = 0; i < data.length; i++) {
                if (data[i] == 0x03) {
                    rxBuf.push(data[i]);

                    let rx = node.bssLib.decapsulateCommand(Buffer.from(rxBuf));
                    
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

                    rxBuf = [];
                }
                else {
                    rxBuf.push(data[i]);
                }
            }
        });
    }
    RED.nodes.registerType("soundweb-server", SoundwebServerNode);
}