/**
 * Created by Hien on 5/31/2014.
 */

angular.module('arena.api.service', [

])
    .factory('apiSrv', function() {
        var factory = {};
        factory.serverPath = function() {
            if (window.location.hostname === "localhost") {
                return "http://staging.why.academy:8080/";
            }
            else {
                return "http://api.why.academy/";
            }
        };
        return factory;
    });