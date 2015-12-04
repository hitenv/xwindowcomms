/*! xwindowcomms - v0.0.3 - 2015-12-04
* Copyright (c) 2015 ; Licensed  */
/*jslint browser: true */
/*global console: false */
/* exported xWindowComms */


window.xWindowComms = window.xWindowComms || (function() {
        var parent = function(){
            this.popup = null;
            this.handshake = null;
            this.connected = false;
            this.buffer = [];
            this.id = Math.random();

            this.initiate = function(url, name, options){
                this.popup = window.open(url, name, options);

                var payload = {
                    action: 'initiate',
                    status: false,
                    type: 'xWindowComms'
                };

                this.handshake = setInterval(
                    function () {
                        this.sendMessage(payload);
                    }.bind(this), 1000);

            };

            this.sendMessage = function (payload) {
                payload.id = this.id;
                payload.type = 'xWindowComms';

                if (this.connected || payload.action === 'initiate') {
                    this.popup.postMessage(payload, '*');
                } else {
                    this.buffer.push(payload);
                }
            };

            this.receiver = function (callback, debug) {
                var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
                var eventer = window[eventMethod];
                var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";

                eventer(messageEvent, function (e) {
                    if (debug === true) {
                        console.log(e);
                    }

                    if (typeof event.data === 'object') {
                        if (event.data.type === 'xWindowComms'){
                            if (event.data.id === this.id) {
                                if (event.data.action === 'initiate') {
                                    if (event.data.status === true) {
                                        clearInterval(this.handshake);
                                        this.connected = true;
                                        if (this.buffer.length > 0) {
                                            for (var i = 0; i < this.buffer.length; i++) {
                                                this.sendMessage(this.buffer[i]);
                                            }

                                            this.buffer = [];
                                        }
                                    }
                                }

                                callback(e);
                            }
                        }
                    }
                }.bind(this));
            };
        };
        var popup = function(){
            this.parent = null;
            this.id = null;
            this.connected = false;
            this.buffer = [];



            this.initiate = function (callback, debug) {
                var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
                var eventer = window[eventMethod];
                var messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";

                var eventFunction = function (e) {
                    if (debug === true) {
                        console.log(e);
                    }

                    if (typeof event.data === 'object') {
                        if (event.data.type === 'xWindowComms'){
                            if (event.data.action === 'initiate') {
                                var payload = {
                                    action: 'initiate',
                                    status: true
                                };

                                this.connected = true;

                                this.id = event.data.id;

                                this.parent = event.source;

                                this.sendMessage(payload);

                                if (this.buffer.length > 0) {
                                    for (var i = 0; i < this.buffer.length; i++) {
                                        this.sendMessage(this.buffer[i]);
                                    }

                                    this.buffer = [];
                                }
                            }

                            callback(e);
                        }
                    }
                }.bind(this);

                eventer(messageEvent, eventFunction) ;
            };

            this.sendMessage = function(payload){
                payload.id = this.id;
                payload.type = 'xWindowComms';

                if (this.connected || payload.action === 'initiate') {
                    this.parent.postMessage(payload, '*');
                } else {
                    this.buffer.push(payload);
                }
            };

        };

        var xWindowComms = {
            parent : parent,
            popup: popup
        };

        return xWindowComms;
    }());