/**
 * Created by Hien on 5/30/2014.
 */

angular.module('arena.users.service', [
    'ngCookies'
])
    .service('userSrv', function ($cookies) {

        var authData = null;

        var getUserFromCookies = function () {

           if (authData === null) {
                var user = null;
                if ($cookies.user) {

                    // Decode cookie UTF8 string then parse
                    var userString = decodeURIComponent($cookies.user);
                    user = JSON.parse(userString);
                }
                authData = user;
           }

            return authData;
        };

        this.isAuthenticated = function () {
            var authenticated = false;
            var user = getUserFromCookies();
            if (user) {
                var expires = new Date(user.token.expires);
                var now = new Date();
                if (now < expires) {
                    authenticated = true;
                }
            }
            return authenticated;
        };

        this.logout = function () {
            delete $cookies.user;
            authData = null;
        };

//        this.loadFacebookProfile = function(callback) {
//            FB.getLoginStatus(function(response) {
//                if (response.status === 'connected') {
//                    console.log(response);
//                    console.log('Logged in.');
//                    FB.api('/me', function(response) {
//                        callback(response);
//                    });
//                }
//                else {
//                    FB.login(function(){
//                        FB.api('/me', function(response) {
//                            callback(response);
//                        });
//                    }, {scope: 'public_profile'});
//                }
//            });
//        };

        this.getProfile = function () {

            var profile;

            if (this.isAuthenticated()) {
                var user = getUserFromCookies();
                profile = user.profile;
            }            

            return profile;
        }

        this.getToken = function () {
            var user = getUserFromCookies();
            if (this.isAuthenticated()) {
                var token = user.token;
                return token;
            }
            return null;
        }

    });