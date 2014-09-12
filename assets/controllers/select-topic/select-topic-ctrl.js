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

        $scope.gameData = gameSrv.gameData;

        $scope.topics=["0"];
        $scope.tagDetails=[
            {"name":"Listening Photographs (Starter)","tags":["7","9","13"]},
            {"name":"Listening Question-Response (Starter)","tags":["7","9","14"]},
            {"name":"Grammar","tags":["4","9"]}
        ];

        var multipleTags=["1"];

        function mergeTags(tags){
            for(var i=0; i<tags.length; i++){
               multipleTags.push(tags[i]);
            }
        };

        $scope.chooseTags=function(tags){
            audioSrv.playClickedButton();
            mergeTags(tags);


            gameSrv.tags=multipleTags;
            console.log(multipleTags);
            gameSrv.challengeFriends();
        };

    }]);
