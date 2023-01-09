module.exports = function(RED) {
    "use strict";

    function Speed(config) {
        RED.nodes.createNode(this,config);
        let lastMsg;
        let topic = null;

        if (config.topic) {
            topic = config.topic;
        }
        
        // Retrieve the config node
        this.server = RED.nodes.getNode(config.server);

        let cmd_id = Buffer.from([0x88]);
        let address = RED.util.evaluateNodeProperty(config.address, config.addressType);

        this.status({ fill: "red", shape: "ring", text: "disconnected" });
        
        /****************************************************
         * TCP Socket Event Handlers
         ****************************************************/

        this.server.socket.on('ready', () => {
            this.status({ fill: "green", shape: "dot", text: "connected" });
            
            // subscribe to object
            this.server.sendCommand(Buffer.from([0x89]), address, Buffer.from([0, 0, 0, 0]));
        });

        this.server.socket.on('error', (err) => {
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
                    _msgid: Date.now().toString(16),
                    topic: "",
                    payload: ""
                }
                if (topic) {
                    msg.topic = topic;
                }
                msg.payload = this.server.bssLib.decFrequencyOrSpeed(rx.data);
                this.send(msg);
            }
        });

        /****************************************************
         * Node Event Handlers
         ****************************************************/

        this.on('input', (msg) => {
            if (typeof msg.payload == 'number') {
                lastMsg = msg;
                var data = this.server.bssLib.encFrequencyOrSpeed(msg.payload);
                this.server.sendCommand(cmd_id, address, data);
            }
        });
    }

    RED.nodes.registerType("soundweb-speed", Speed);
}