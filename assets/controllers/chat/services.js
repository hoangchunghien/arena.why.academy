/// <reference path="Scripts/angular.js" />
/// <reference path="app.js" />
/// <reference path="js/socket.io-1.0.6.js" />
app.factory('socket', function ($rootScope) {
    var socket = io.connect('ec2-54-179-163-38.ap-southeast-1.compute.amazonaws.com:8080');
    var disconnect = false;
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                if (!disconnect) {
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                }
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        },
        disconnect: function () {
            disconnect = true;
            socket.disconnect();
        }
    }
});