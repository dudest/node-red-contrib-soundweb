module.exports = function(RED) {
    "use strict";

    function LevelControl(config) {
        RED.nodes.createNode(this,config);
        let node = this;
        let lastMsg;
        let topic = null;

        if (config.topic) {
            topic = config.topic;
        }
        
        // Retrieve the config node
        this.server = RED.nodes.getNode(config.server);

        let cmd_id = Buffer.from([0x8d]);
        let address = RED.util.evaluateNodeProperty(config.address, config.addressType);

        node.status({ fill: "red", shape: "ring", text: "disconnected" });
        
        /****************************************************
         * TCP Socket Event Handlers
         ****************************************************/

        this.server.socket.on('ready', function() {
            node.status({ fill: "green", shape: "dot", text: "connected" });
            
            // subscribe to object
            var cmd = Buffer.concat([Buffer.from([0x8e]), address, Buffer.from([0, 0, 0, 0])]);
            node.server.socket.write(node.server.bssLib.encapsulateCommand(cmd));
        });

        this.server.socket.on('error', function() {
            node.status({ fill: "red", shape: "ring", text: "error" });
        });

        this.server.socket.on('timeout', function() {
            node.status({ fill: "red", shape: "dot", text: "error" });
        });

        /****************************************************
         * Data rx handler
         ****************************************************/

        this.server.on('rxData', function(rx) {
            if (Buffer.compare(rx.address, address) == 0 && Buffer.compare(rx.cmd_id, cmd_id) == 0) {
                let msg = lastMsg || {
                    _msgid: Date.now().toString(16),
                    topic: "",
                    payload: ""
                }
                if (topic) {
                    msg.topic = topic;
                }
                msg.payload = node.server.bssLib.getDataPercent(rx.data);
                node.send(msg);
            }
        });

        /****************************************************
         * Node Event Handlers
         ****************************************************/

        this.on('input', function(msg) {
            if (typeof msg.payload == 'number' && msg.payload >= 0 && msg.payload <= 100) {
                lastMsg = msg;

                var data = node.server.bssLib.setDataPercent(msg.payload);
                var cmd = Buffer.concat([cmd_id, address, data]);
                this.server.socket.write(this.server.bssLib.encapsulateCommand(cmd));
            }
        });
    }

    RED.nodes.registerType("soundweb-percent", LevelControl);
}