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
        $scope.activities = [];
        $scope.profile = userSrv.getProfile();
        apolloSrv.getFriends($scope.profile.id, function (friends) {
            $scope.friends = friends;
        });
        apolloSrv.getAppActivities($scope.profile.id, true, "actor", function (activities) {
            console.log(activities);
            for(var i=0; i<activities.length; i++){
                var activity=activities[i];
                var metadata=activity.metadata;
                if(metadata){
                    console.log(activity);
                    activity.metadata=JSON.parse(metadata);
                    activity.is_finished=activity.metadata.is_finished;
                }
            }
            console.log(activities);
            $scope.activities = activities;
        });

    }]);
