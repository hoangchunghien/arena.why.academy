/**
 * Created by VanLinh on 8/29/2014.
 */

var app = angular.module('arena.select-topic.controller', [
    'ui.router',
    'arena.audio.service',
    'arena.users.service',
    'arena.users.facebook.service',
    'arena.apollo.service',
    'arena.transfer.service',
    'arena.game.service'

]);
app.controller('arena.select-topic.ctrl', [ '$scope', '$state', '$http', 'userSrv', 'audioSrv', 'facebookSrv', 'apolloSrv', 'transferSrv', 'gameSrv',
    function ($scope, $state, $http, userSrv, audioSrv, facebookSrv, apolloSrv, transferSrv, gameSrv) {
        audioSrv.init();
        audioSrv.playOpenOnGameAudio();
        $http.get('/data/json-tags/tags.json').success(function(data) {
            $scope.gameData = gameSrv.gameData;

            if(gameSrv.gameData.players.opponent){
                $scope.tags=data.tags;
            }else{

                $scope.tags=[data.tags[0]];
            }

        });


        $scope.indexOfTopic=0;
        $scope.chooseTopic=function(index){
            $scope.indexOfTopic=index;
        };

        $scope.chooseTags=function(tags){
            audioSrv.playClickedButton();

            if(tags){
                gameSrv.tags=tags;
            }
            gameSrv.challengeFriends();
        };

    }]);
