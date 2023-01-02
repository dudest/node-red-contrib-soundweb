module.exports = function(RED) {
    "use strict";

    function ParameterPresets(config) {
        RED.nodes.createNode(this,config);
        let node = this;
        let lastMsg;
        let topic = null;

        if (config.topic) {
            topic = config.topic;
        }
        
        // Retrieve the config node
        this.server = RED.nodes.getNode(config.server);

        let cmd_id = Buffer.from([0x8c]);

        node.status({ fill: "red", shape: "ring", text: "disconnected" });
        
        /****************************************************
         * TCP Socket Event Handlers
         ****************************************************/

        this.server.socket.on('ready', function() {
            node.status({ fill: "green", shape: "dot", text: "connected" });
        });

        this.server.socket.on('error', function() {
            node.status({ fill: "red", shape: "ring", text: "error" });
        });

        this.server.socket.on('timeout', function() {
            node.status({ fill: "red", shape: "dot", text: "error" });
        });

        /****************************************************
         * Node Event Handlers
         ****************************************************/

        this.on('input', function(msg) {
            if (typeof msg.payload == 'number') {
                lastMsg = msg;

                var data = node.server.bssLib.encDiscrete(msg.payload);
                var cmd = Buffer.concat([cmd_id, data]);
                this.server.socket.write(this.server.bssLib.encapsulateCommand(cmd));
            }
        });
    }

    RED.nodes.registerType("soundweb-parameterPresets", ParameterPresets);
}