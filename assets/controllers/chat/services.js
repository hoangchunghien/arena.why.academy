/// <reference path="Scripts/angular.js" />
/// <reference path="app.js" />
/// <reference path="js/socket.io-1.0.6.js" />
app.factory('socket', function ($rootScope) {
    var socket = io.connect('localhost:9092');
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