/**
 * Created by Hiten on 27/11/2015.
 */
/*jslint browser: true */
/*global console: false */
/* exported xWindowComms */
var xWindowComms = function() {
    var xWindowComms = {
        parent: {},
        popup: {}
    };

    var id = Math.random();

    xWindowComms.parent.popup = null;
    xWindowComms.handshake = null;

    xWindowComms.parent.connected = false;
    xWindowComms.buffer = [];

    xWindowComms.parent.initiate = function (url, name, options) {
        xWindowComms.parent.popup = window.open(url, name, options);

        var payload = {
            action: 'initiate',
            status: false
        };

        xWindowComms.handshake = setInterval(
            function () {
                xWindowComms.parent.sendMessage(payload);
            }, 1000);
    };


    xWindowComms.parent.sendMessage = function (payload) {
        payload.id = id;

        if (xWindowComms.parent.connected || payload.action === 'initiate') {
            xWindowComms.parent.popup.postMessage(payload, '*');
        } else {
            xWindowComms.buffer.push(payload);
        }
    };

    xWindowComms.parent.receiver = function (callback, debug) {
        var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
        var eventer = window[eventMethod];
        var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";

        eventer(messageEvent, function (e) {
            if (debug === true) {
                console.log(e);
            }

            if (typeof event.data === 'object') {
                if (event.data.id === id){
                    if (event.data.action === 'initiate') {
                        if (event.data.status === true) {
                            clearInterval(xWindowComms.handshake);
                            xWindowComms.parent.connected = true;
                            if (xWindowComms.buffer.length > 0) {
                                for (var i = 0; i < xWindowComms.buffer.length; i++) {
                                    xWindowComms.parent.sendMessage(xWindowComms.buffer[i]);
                                }

                                xWindowComms.buffer = [];
                            }
                        }
                    }

                    callback(e);
                }
            }
        });
    };

    xWindowComms.popup.parent = null;
    xWindowComms.popup.id = null;

    xWindowComms.popup.initiate = function (callback, debug) {
        var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
        var eventer = window[eventMethod];
        var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";

        eventer(messageEvent, function (e) {
            if (debug === true) {
                console.log(e);
            }

            if (typeof event.data === 'object') {
                if (event.data.action === 'initiate') {
                    var payload = {
                        action: 'initiate',
                        status: true
                    };

                    xWindowComms.popup.id = event.data.id;

                    xWindowComms.popup.parent = event.source;

                    xWindowComms.popup.sendMessage(payload);
                }
            }

            callback(e);
        });
    };

    xWindowComms.popup.sendMessage = function (payload) {
        payload.id = xWindowComms.popup.id;
        xWindowComms.popup.parent.postMessage(payload, '*');
    };

    return xWindowComms;
};