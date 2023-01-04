var net = require('net');
var bssLib = require('./bss_lib');

module.exports = function(RED) {
    "use strict";
    
    function SoundwebServerNode(n) {
        RED.nodes.createNode(this,n);

        let host = n.host;
        let port = n.port;
        let connectionLog = n.connection_logging;
        let communicationLog = n.communication_logging;
        this.socket = net.connect(port, host);
        this.bssLib = bssLib;
        
        this.socket.setMaxListeners(0);
        this.setMaxListeners(0);

        this.sendCommand = (cmd_id, address, data) => {
            this.socket.write(this.bssLib.encapsulateCommand(Buffer.concat([cmd_id, address, data])));
            if (communicationLog) {
                this.log('[TX$] {cmd_id: ' + cmd_id.toString('hex') + ', address: ' + address.toString('hex') + ', data: ' + data.toString('hex') + '}')
            }
        }

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

                        if (communicationLog) {
                            this.log('[RX$] {cmd_id: ' + temp.cmd_id.toString('hex') + ', address: ' + temp.address.toString('hex') + ', data: ' + temp.data.toString('hex') + '}');
                        }
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
            if (connectionLog) {
                this.error(err.toString());
            }
        });

        /**
         * On CONNECT
         */
        this.socket.on('connect', () => {
            if (connectionLog) {
                this.log('socket connected');
            }
        });

        /**
         * On CLOSE
         */
        this.socket.on('close', () => {
            if (connectionLog) {
                this.log('socket closed');
            }
        });
        
        /**
         * On DRAIN
         */
        this.socket.on('drain', () => {
            if (connectionLog) {
                this.log('write buffer cleared');
            }
        });

        /**
         * On END
         */
        this.socket.on('end', () => {
            if (connectionLog) {
                this.log('server ended transmission');
            }
        });

        /**
         * On READY
         */
        this.socket.on('ready', () => {
            if (connectionLog) {
                this.log('socket ready');
            }
        });

        /**
         * On TIMEOUT
         */
        this.socket.on('timeout', () => {
            if (connectionLog) {
                this.log('socket timeout');
            }
        });

        /***************************************************************************
         * Node Event Listeners
         ***************************************************************************/
        this.on('close', (removed, done) => {
            if (removed) {
                this.socket.destroy();
            }
            else {
                this.socket.end();
            }
            done();
        });
    }
    RED.nodes.registerType("soundweb-server", SoundwebServerNode);
}