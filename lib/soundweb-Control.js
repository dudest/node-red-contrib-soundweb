module.exports = function(RED) {
    "use strict";

    function SoundwebControl(config) {
        RED.nodes.createNode(this,config);
        let lastMsg;
        let topic = null;
        let cmd_id = Buffer.from([parseInt(config.command)]);
        let scaleType = parseInt(config.scale);
        let address = RED.util.evaluateNodeProperty(config.address, config.addressType);

        if (config.topic) {
            topic = config.topic;
        }
        
        // Retrieve the config node
        this.server = RED.nodes.getNode(config.server);

        this.status({ fill: "red", shape: "ring", text: "disconnected" });

        /****************************************************
        * Helper functions
        ****************************************************/
        
        function subscribeId(cmdId) {
            switch (cmdId[0]) {
                case 0x88:
                    return Buffer.from([0x89]);
                case 0x8d:
                    return Buffer.from([0x8e]);
                default:
                    return null;
            }
        }

        function unsubscribeId(cmdId) {
            switch (cmdId[0]) {
                case 0x88:
                    return Buffer.from([0x8a]);
                case 0x8d:
                    return Buffer.from([0x8f]);
                default:
                    return null;
            }
        }
        
        /****************************************************
         * TCP Socket Event Handlers
         ****************************************************/

        this.server.socket.on('ready', () => {
            this.status({ fill: "green", shape: "dot", text: "connected" });
            
            this.server.sendCommand(subscribeId(cmd_id), address, Buffer.from([0, 0, 0, 0]));
        });

        this.server.socket.on('error', () => {
            this.status({ fill: "red", shape: "ring", text: "error" });
        });

        this.server.socket.on('timeout', () => {
            this.status({ fill: "red", shape: "dot", text: "error" });
        });

        /****************************************************
         * Data rx handler
         ****************************************************/

        this.server.on('rxData', (rx) => {
            if (Buffer.compare(rx.address, address) == 0 && Buffer.compare(rx.cmd_id, cmd_id) == 0) {
                let msg = lastMsg || {
                    topic: "",
                    payload: ""
                }
                if (topic) {
                    msg.topic = topic;
                }
                
                if (cmd_id[0] === 0x88) {
                    switch (scaleType) {
                        case 0:
                            msg.payload = this.server.bssLib.decDiscrete(rx.data);
                            break;
                        case 1:
                            msg.payload = this.server.bssLib.decScalarLinear(rx.data);
                            break;
                        case 2:
                            msg.payload = this.server.bssLib.decGain(rx.data);
                            break;
                        case 3:
                            msg.payload = this.server.bssLib.decDelay(rx.data);
                            break;
                        case 4:
                            msg.payload = this.server.bssLib.decFrequencyOrSpeed(rx.data);
                            break;
                        case 5:
                            msg.payload = this.server.bssLib.decFrequencyOrSpeed(rx.data);
                            break;
                        default:
                            break;
                    }
                }
                else {
                    msg.payload = this.server.bssLib.decPercent(rx.data);
                }

                this.send(msg);
            }
        });

        /****************************************************
         * Node Event Handlers
         ****************************************************/

        this.on('input', (msg) => {

            if (msg.hasOwnProperty('address') && Buffer.isBuffer(msg.address)) {
                this.server.sendCommand(unsubscribeId(cmd_id), address, Buffer.from([0, 0, 0, 0]));
                address = msg.address;
                this.server.sendCommand(subscribeId(cmd_id), address, Buffer.from([0, 0, 0, 0]));
            }

            if (msg.hasOwnProperty('payload') && typeof msg.payload == 'number') {
                lastMsg = msg;
                let data = null;

                if (cmd_id[0] === 0x88) {
                    switch (scaleType) {
                        case 0:
                            data = this.server.bssLib.encDiscrete(msg.payload);
                            break;
                        case 1:
                            data = this.server.bssLib.encScalarLinear(msg.payload);
                            break;
                        case 2:
                            data = this.server.bssLib.encGain(msg.payload);
                            break;
                        case 3:
                            data = this.server.bssLib.encDelay(msg.payload);
                            break;
                        case 4:
                            data = this.server.bssLib.encFrequencyOrSpeed(msg.payload);
                            break;
                        case 5:
                            data = this.server.bssLib.encFrequencyOrSpeed(msg.payload);
                            break;
                        default:
                            break;
                    }
                }
                else {
                    data = this.server.bssLib.encPercent(msg.payload);
                }

                this.server.sendCommand(cmd_id, address, data);
            }
        });

        this.on('close', (removed, done) => {
            if (removed) {
                this.server.sendCommand(unsubscribeId(cmd_id), address, Buffer.from([0, 0, 0, 0]));
            }
            done();
        });
    }

    RED.nodes.registerType("soundweb-Control", SoundwebControl);
}