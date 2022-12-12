module.exports = function(RED) {
    function LevelControl(config) {
        RED.nodes.createNode(this,config);
        
        // Retrieve the config node
        this.server = RED.nodes.getNode(config.server);

        if (this.server) {
            // Do something with:
            //  this.server.host
            //  this.server.port
        } else {
            // No config node configured
        }
        
        node.on('input', function(msg) {
            
            node.send(msg);
        });
    }

    RED.nodes.registerType("soundweb-LevelControl", LevelControl);
}