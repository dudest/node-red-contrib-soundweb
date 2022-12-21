var net = require('net');
var bssLib = require('./bss_lib');

module.exports = function(RED) {
    "use strict";
    
    function SoundwebServerNode(n) {
        RED.nodes.createNode(this,n);

        var host = n.host;
        var port = n.port;
        var server_id = '[soundweb ' + host + ':' + port + ']'
        
        this.socket = net.connect(port, host);
        this.bssLib = bssLib;

        /****************************************************
         * TCP Socket Event Handlers
         ****************************************************/

        this.socket.on('error', function(ex) {
            console.log(server_id + ex);
        });

        // connect
        this.socket.on('connect', function() {
            console.log(server_id + ' connected');
        });

        // ready
        this.socket.on('ready', function() {
            console.log(server_id + ' ready');
        });

        // close
        this.socket.on('close', function() {
            console.log(server_id + ' connection closed');
        });

        // data
        this.socket.on('data', function(data) {
            console.log(server_id + ' ' + data);
        });
    }
    RED.nodes.registerType("soundweb-server", SoundwebServerNode);
}