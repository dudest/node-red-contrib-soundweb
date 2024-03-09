var net = require('net');
var bssLib = require('hiqnet');

module.exports = function(RED) {
    "use strict";
    
    function SoundwebServerNode(n) {
        RED.nodes.createNode(this,n);

        let host = n.host;
        let port = n.port;
        let connectionLog = n.connection_logging === 'true';
        let communicationLog = n.communication_logging === 'true';
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

        // data
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

        // error
        this.socket.on('error', (err) => {
            if (connectionLog) {
                this.error(err.toString());
            }
        });

        // connect
        this.socket.on('connect', () => {
            if (connectionLog) {
                this.log('socket connected');
            }
        });

        // close
        this.socket.on('close', () => {
            if (connectionLog) {
                this.log('socket closed');
            }
        });
        
        // drain
        this.socket.on('drain', () => {
            if (connectionLog) {
                this.log('write buffer cleared');
            }
        });

        // end
        this.socket.on('end', () => {
            if (connectionLog) {
                this.log('server ended transmission');
            }
        });

        // ready
        this.socket.on('ready', () => {
            if (connectionLog) {
                this.log('socket ready');
            }
        });

        // timeout
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