/**
 * Created by VanLinh on 8/07/2014.
 */
var app = angular.module('arena.home.controller', [
    'ui.router',
    'arena.audio.service',
    'arena.users.service',
    'arena.users.facebook.service',
    'arena.apollo.service'

]);
app.controller('arena.home.ctrl', [ '$scope', '$state', '$http', 'userSrv', 'audioSrv', 'facebookSrv', 'apolloSrv',
    function ($scope, $state, $http, userSrv, audioSrv, facebookSrv, apolloSrv) {
        console.log("home game");
        $scope.friends = [];
        $scope.profile = userSrv.getProfile();
        apolloSrv.getFriends($scope.profile.id, function (friends) {
            console.log(friends);
            $scope.friends = friends;
        });

    }]);
