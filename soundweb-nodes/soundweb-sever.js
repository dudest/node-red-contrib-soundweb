module.exports = function(RED) {
    function SoundwebServerNode(n) {
        RED.nodes.createNode(this,n);
        this.host = n.host;
        this.port = n.port;
    }
    RED.nodes.registerType("soundweb-server", SoundwebServerNode);
}