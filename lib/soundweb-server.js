var net = require('net');
var bssLib = require('./bss_lib');

module.exports = function(RED) {
    "use strict";
    
    function SoundwebServerNode(n) {
        RED.nodes.createNode(this,n);

        let host = n.host;
        let port = n.port;
        this.socket = net.connect(port, host);
        this.bssLib = bssLib;

        /***************************************************************************
         * Socket Event Listeners
         ***************************************************************************/

        /**
         * On DATA
         */
        this.socket.on('data', (data) => {
            let rxBuf = [];

            for (let i = 0; i < data.length; i++) {
                if (data[i] == 0x03) {
                    rxBuf.push(data[i]);

                    let rx = this.bssLib.decapsulateCommand(Buffer.from(rxBuf));

                    if (rx) {
                        let temp = {
                            cmd_id: "",
                            address: "",
                            data: ""
                        }
                        temp.cmd_id = this.bssLib.getCommandIdBuffer(rx);
                        temp.address = this.bssLib.getAddressBuffer(rx);
                        temp.data = this.bssLib.getDataBuffer(rx);
                        this.emit('rxData', temp);

                        this.log('[RX$] {cmd_id: ' + temp.cmd_id.toString('hex') + ', address: ' + temp.address.toString('hex') + ', data: ' + temp.data.toString('hex') + '}');
                    }

                    rxBuf = [];
                }
                else {
                    rxBuf.push(data[i]);
                }
            }
        });

        /**
         * On ERROR
         */
        this.socket.on('error', (err) => {
            this.error(err.toString());
        });

        /**
         * On CONNECT
         */
        this.socket.on('connect', () => {
            this.log('socket connected');
        });

        /**
         * On CLOSE
         */
        this.socket.on('close', () => {
            this.log('socket closed');
        });
        
        /**
         * On DRAIN
         */
        this.socket.on('drain', () => {
            this.log('write buffer cleared');
        });

        /**
         * On END
         */
        this.socket.on('end', () => {
            this.log('server ended transmission');
        });

        /**
         * On READY
         */
        this.socket.on('ready', () => {
            this.log('socket ready');
        });

        /**
         * On TIMEOUT
         */
        this.socket.on('timeout', () => {
            this.log('socket timeout');
        });
    }
    RED.nodes.registerType("soundweb-server", SoundwebServerNode);
}