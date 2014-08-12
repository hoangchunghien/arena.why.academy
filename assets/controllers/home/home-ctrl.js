/**
 * Created by VanLinh on 8/07/2014.
 */
var app = angular.module('arena.home.controller', [
    'ui.router',
    'arena.audio.service',
    'arena.users.service',
    'arena.users.facebook.service',
    'arena.apollo.service',
    'arena.transfer.service',
    'arena.game.service'

]);
app.controller('arena.home.ctrl', [ '$scope', '$state', '$http', 'userSrv', 'audioSrv', 'facebookSrv', 'apolloSrv','transferSrv','gameSrv',
    function ($scope, $state, $http, userSrv, audioSrv, facebookSrv, apolloSrv,transferSrv,gameSrv) {
        console.log("home game");
        $scope.friends = [];
        $scope.activities = [];
        $scope.profile = userSrv.getProfile();

        $scope.getOpponentIDs=function(id){
            var opponentIDs=[];
            opponentIDs.push(id);
            transferSrv.setOpponentIDs(opponentIDs);
            $state.go("challenge");
        }

        apolloSrv.getFriends($scope.profile.id, function (friends) {
            $scope.friends = friends;
        });
        apolloSrv.getAppActivities($scope.profile.id, true, "actor", function (activities) {
            for(var i=0; i<activities.length; i++){
                var activity=activities[i];
                var metadata=activity.metadata;
                if(metadata){
                    console.log(activity);
                    activity.metadata=JSON.parse(metadata);
                    activity.is_finished=activity.metadata.is_finished;
                }
            }
            $scope.activities = activities;
        });

        $scope.challengeFriend=function(friend){
            var friends=[];
            friends.push(friend);
            gameSrv.setFriends(friends);
            gameSrv.challengeFriends();
        };

    }]);
