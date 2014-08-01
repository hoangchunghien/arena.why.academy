/**
 * Created by hoang_000 on 8/1/2014.
 */
angular.module('arena.users.facebook.service', [

])
    .service('facebookSrv', function () {
        var profile;
        var self=this;
        this.loadFacebookProfile = function (callback) {
            if (profile) {
                callback(profile);
                return;
            }
            self.initFacebookService(callback);

        };
        this.getFacebookProfile = function () {
            return profile;
        };
        this.initFacebookService = function (callback) {
            window.fbAsyncInit = function () {
                FB.init({
                    appId: '319210081588306',
                    xfbml: true,
                    version: 'v2.0'
                });
                FB.getLoginStatus(function (response) {
                    if (response.status === 'connected') {
                        console.log(response);
                        console.log('Logged in.');
                        FB.api('/me', function (response) {
                            profile = response;
                            callback(profile);
                        });
                    }
                    else {
                        FB.login(function () {
                            FB.api('/me', function (response) {
                                profile = response;
                                callback(profile);
                                console.log('Successful login for: ' + response.name);
                                document.getElementById('status').innerHTML =
                                    'Thanks for logging in, ' + response.name + '!';
                            });
                        }, {scope: 'public_profile,user_friends,email'});
                    }
                });
            };
            (function (d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) {
                    return;
                }
                js = d.createElement(s);
                js.id = id;
                js.src = "//connect.facebook.net/en_US/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
        }
    });
