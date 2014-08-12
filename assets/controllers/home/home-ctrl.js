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

//        $scope.getOpponentIDs=function(id){
//            var opponentIDs=[];
//            opponentIDs.push(id);
//            transferSrv.setOpponentIDs(opponentIDs);
//            $state.go("challenge");
//        }

        apolloSrv.getFriends($scope.profile.id, function (friends) {
            $scope.friends = friends;
        });
        apolloSrv.getAppActivities($scope.profile.id, true, null, function (activities) {
            // prepare activity status

            for (var i = activities.length - 1; i >= 0; i--) {
                activity = activities[i];

                if ($scope.profile.id ==  activity.receiver.id) {
                    if (activity.is_finished) {
                        activity.status = 'show_result';
                    } else {
                        activity.status = 'accepting';
                    }
                } else {
                    activity.status = 'waiting';
                }
            };

            // console.log(activities);

            $scope.activities = activities;
        });

        $scope.challengeFriend=function(friend){
            var friends=[];
            friends.push(friend);
            gameSrv.setFriends(friends);
            gameSrv.challengeFriends();
        };


        $scope.challengeWithRandom=function(){
            var friends=[];
            gameSrv.setFriends(friends);
            gameSrv.challengeFriends();
        };


        $scope.acceptChallenge=function(activity) {
            gameSrv.acceptChallenge(activity.object_id);
        }

        $scope.showResult = function(activity) {
            gameSrv.showResult(activity.object_id);
        }

        $scope.activityAction = function(activity) {
            if (activity.is_finished) {
                $scope.showResult(activity);
            } else {
                $scope.acceptChallenge(activity);
            }
        }

        $scope.activityActionString = function(activity) {
            if (activity.status == 'show_result') {
                return 'Xem Kết quả';
            } else if (activity.status == 'waiting') {
                return 'Đang chờ';
            } else if (activity.status == 'accepting') {
                return 'Nhận Lời';
            }
        }

    }]);
