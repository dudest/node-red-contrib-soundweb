module.exports = function(RED) {
    "use strict";

    function SoundwebControl(config) {
        RED.nodes.createNode(this,config);
        let lastMsg;
        let topic = null;
        let cmd_id = Buffer.from([parseInt(config.command)]);
        let scaleType = parseInt(config.scale);
        let address = RED.util.evaluateNodeProperty(config.address, config.addressType) || null;

        if (config.topic) {
            topic = config.topic;
        }
        
        // Retrieve the config node
        this.server = RED.nodes.getNode(config.server);

        this.status({ fill: "red", shape: "ring", text: "disconnected" });

        /****************************************************
         * Helper functions
         ****************************************************/
        
        function Subscribe() {
            let subscribe_id = null;

            switch (this.cmd_id[0]) {
                case 0x88:
                    subscribe_id = Buffer.from([0x89]);
                    break;
                case 0x8d:
                    subscribe_id = Buffer.from([0x8e]);
                    break;
                default:
                    break;
            }

            this.server.sendCommand(subscribe_id, this.address, Buffer.from([0, 0, 0, 0]));
        }

        function Unsubscribe() {
            let unsubscribe_id = null;

            switch (this.cmd_id[0]) {
                case 0x88:
                    unsubscribe_id = Buffer.from([0x8a]);
                    break;
                case 0x8d:
                    unsubscribe_id = Buffer.from([0x8f]);
                    break;
                default:
                    break;
            }

            this.server.sendCommand(unsubscribe_id, this.address, Buffer.from([0, 0, 0, 0]));
        }

        /****************************************************
         * TCP Socket Event Handlers
         ****************************************************/

        this.server.socket.on('ready', () => {
            this.status({ fill: "green", shape: "dot", text: "connected" });
            
            // subscribe to object
            if (address !== null) {
                Subscribe(address);
            }
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
            if (Buffer.compare(rx.address, this.address) == 0 && Buffer.compare(rx.cmd_id, this.cmd_id) == 0) {
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
            lastMsg = msg;

            if (msg.hasOwnProperty('address') && Buffer.isBuffer(msg.address)) {
                if (this.address === null) {
                    this.address = msg.address;
                    Subscribe();
                }
                else {
                    Unsubscribe();
                    this.address = msg.address;
                    Subscribe();
                }
            }

            if (msg.hasOwnProperty('payload') && typeof msg.payload == 'number') {
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

                this.server.sendCommand(this.cmd_id, this.address, data);
            }
        });

        this.on('close', (removed, done) => {
            if (removed) {
                // unsubscribe to object
                if (address !== null) {
                    Unsubscribe()
                }
            }
            done();
        });
    }

    RED.nodes.registerType("soundweb-Control", SoundwebControl);
}