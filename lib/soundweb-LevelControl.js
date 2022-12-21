module.exports = function(RED) {
    "use strict";

    function LevelControl(config) {
        RED.nodes.createNode(this,config);
        let node = this;
        var lastMsg;
        
        // Retrieve the config node
        this.server = RED.nodes.getNode(config.server);

        let cmd_id = Buffer.from([141]);
        let address = RED.util.evaluateNodeProperty(config.address, config.addressType);

        node.status({ fill: "red", shape: "ring", text: "disconnected" });
        
        /****************************************************
         * TCP Socket Event Handlers
         ****************************************************/

        this.server.socket.on('ready', function() {
            node.status({ fill: "green", shape: "dot", text: "connected" });
            
            // subscribe to object
            var cmd = Buffer.concat([Buffer.from([142]), address, Buffer.from([0, 0, 0, 0])]);
            node.server.socket.write(node.server.bssLib.encapsulateCommand(cmd));
        });

        this.server.socket.on('error', function() {
            node.status({ fill: "red", shape: "ring", text: "error" });
        });

        this.server.socket.on('timeout', function() {
            node.status({ fill: "red", shape: "dot", text: "error" });
        });

        this.server.socket.on('data', function(data) {
            // if last message doesn't exist, create one.
            var msg = lastMsg || {
                _msgid: Date.now().toString(16),
                topic: "",
                payload: ""
            };

            // decapsulate command
            // check address matches this node.
            // if so, send feedback to outlet.
            // in not, ignore.
            msg.payload = node.server.bssLib.decapsulateCommand(data);
            node.send(msg);
        });

        /****************************************************
         * Node Event Handlers
         ****************************************************/

        this.on('input', function(msg) {
            lastMsg = msg;
            var cmd = Buffer.concat([cmd_id, address, Buffer.from([0, parseInt(msg.payload), 0, 0])]);
            this.server.socket.write(this.server.bssLib.encapsulateCommand(cmd));
        });
    }

    RED.nodes.registerType("soundweb-LevelControl", LevelControl);
}