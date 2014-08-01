/**
 * Created by Hien on 5/30/2014.
 */

angular.module('arena.navigation.controller', [
    'ui.router',
    'arena.users.service',
    'arena.users.facebook.service'
])
    .controller('NavCtrl', function ($scope,$state, $http, userSrv, facebookSrv,$state) {

        $scope.user = null;

        $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            $scope.loading = true;
            if(!facebookSrv.getFacebookProfile()){
                console.log(window.location);
                if(window.location.pathname!=="/"){
                    window.location='/';
                }
            }
        });

        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            $scope.loading = false;
        });

        $scope.init = function () {
//            document.cookie = decodeURIComponent(document.cookie);
//            $scope.profile = userSrv.getProfile() || {};

            facebookSrv.loadFacebookProfile(function(response) {
                $scope.profile = response;
                $scope.profile.picture_url = 'http://graph.facebook.com/' + response.id + "/picture";
                console.log($scope.profile);
                console.log($scope.profile.name);
                $state.go('main');
//                $scope.$apply();

            });
//            $scope.authenticated = userSrv.isAuthenticated();
            $scope.authenticated = true;
            $scope.loadUserNavBar();
        };

        $scope.doLogin = function() {
            window.location.href = "/login/facebook";
        };

        $scope.doLogout = function () {
            // user.logout();
            window.location.href = "/logout";
            $scope.init();
        };

        $scope.loadUserNavBar = function () {
//            $scope.isAuth = false;
            $scope.isAuth = true;
//            if (userSrv.isAuthenticated()) {
//                $scope.isAuth = true;
//            }
//            else {
//                $scope.isAuth = false;
//            }
        };

        $scope.getLoginOrLogoutUrl = function () {
            var url = "";
            if ($scope.user.authenticated) {
                url = "/logout";
            }
            else {
                url = "/login/facebook";
            }
            return url;
        };


    });