/**
 * Created by Hien on 5/30/2014.
 */
var facebookLoginRequested = false;

angular.module('arena.navigation.controller', [
    'ui.router',
    'arena.users.service',
    'arena.users.facebook.service'
])
    .controller('NavCtrl', function ($scope, $state, $http, userSrv, facebookSrv) {

        $scope.user = null;

        $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            $scope.loading = true;
            if (!userSrv.isAuthenticated()) {
                facebookLoginRequested = true;
                $scope.doLogin();
            }
            if (!facebookLoginRequested) {
                facebookLoginRequested = true;
                facebookSrv.initFacebookService(function (response) { });
            }
        });

        $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $scope.loading = false;
            if (!userSrv.isAuthenticated()) {
                console.log(window.location);
//                if (window.location.pathname !== "/") {
//                    window.location.href = '/';
//                }
                if (toState.name !== "main") {
                    window.location.href = '/';
                }
//                $scope.doLogin();
            }
            ApolloAnalytics.track(
                "Changed State",
                { "toState": toState.name, "fromState": fromState.name}
            );
        });

        $scope.init = function () {
            document.cookie = decodeURIComponent(document.cookie);
            $scope.profile = userSrv.getProfile() || {};
            $scope.authenticated = userSrv.isAuthenticated();
            $scope.loadUserNavBar();
        };

        $scope.doLogin = function () {
            facebookSrv.loadFacebookProfile(function (response) {
                window.location = "/auth/facebook?token=" + FB.getAccessToken();
            });
        };

        doLogin = $scope.doLogin;

        $scope.doLogout = function () {
            // user.logout();
            window.location = "/logout";
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