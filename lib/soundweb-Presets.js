module.exports = function(RED) {
    "use strict";

    function SoundwebPresets(config) {
        RED.nodes.createNode(this,config);

        let cmd_id = Buffer.from([parseInt(config.command)]);
        
        // Retrieve the config node
        this.server = RED.nodes.getNode(config.server);

        this.status({ fill: "red", shape: "ring", text: "disconnected" });
        
        /****************************************************
         * TCP Socket Event Handlers
         ****************************************************/

        this.server.socket.on('ready', () => {
            this.status({ fill: "green", shape: "dot", text: "connected" });
        });

        this.server.socket.on('error', () => {
            this.status({ fill: "red", shape: "ring", text: "error" });
        });

        this.server.socket.on('timeout', () => {
            this.status({ fill: "red", shape: "dot", text: "error" });
        });

        /****************************************************
         * Node Event Handlers
         ****************************************************/

        this.on('input', (msg) => {
            if (typeof msg.payload === 'number') {
                var cmd = Buffer.concat([cmd_id, this.server.bssLib.encDiscrete(msg.payload)]);
                this.server.socket.write(this.server.bssLib.encapsulateCommand(cmd));
            }
        });
    }
    RED.nodes.registerType("soundweb-Presets", SoundwebPresets);
}