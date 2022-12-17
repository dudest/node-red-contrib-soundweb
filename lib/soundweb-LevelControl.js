module.exports = function(RED) {
    "use strict";

    function LevelControl(config) {
        RED.nodes.createNode(this,config);
        let node = this
        
        // Retrieve the config node
        this.server = RED.nodes.getNode(config.server);

        let cmd_id = Buffer.from([141]);
        let address = RED.util.evaluateNodeProperty(config.address, config.addressType);

        node.status({fill:"red",shape:"ring",text:"disconnected"});
        
        /****************************************************
         * TCP Socket Event Handlers
         ****************************************************/

        this.server.socket.on('ready', function() {
            node.status({fill:"green",shape:"dot",text:"connected"});
        });

        this.server.socket.on('error', function() {
            node.status({fill:"red",shape:"ring",text:"error"});
        });

        this.server.socket.on('timeout', function() {
            node.status({fill:"red",shape:"dot",text:"error"});
        });

        this.server.socket.on('data', function(data) {
            var msg;
            msg.payload = typeof data;
            this.send(msg);
        });

        /****************************************************
         * Node Event Handlers
         ****************************************************/

        this.on('input', function(msg) {
            var data = Buffer.from([0, parseInt(msg.payload), 0, 0]);
            var cmd = this.server.encapsulateCommand(cmd_id, address, data);
            this.server.socket.write(cmd);
        });
    }

    RED.nodes.registerType("soundweb-LevelControl", LevelControl);
}