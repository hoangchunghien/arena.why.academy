angular.module('arena.game.service', [

])
    .service('gameSrv', function (apolloSrv, $state) {

        var self = this;
        var TAGS = ['1'];

        var state = $state;

        this.setState = function (value) {
            state = value;
        };

        this.getState = function () {
            return state;
        };

        var friends = null;
        var gameFSM = null;

        this.getGameFSM = function () {
            return gameFSM;
        };

        this.destroy = function () {
            gameFSM = null;
        };

        this.setFriends = function (values) {
            friends = values;
        };

        this.getFriends = function () {
            return friends;
        };


        this.challengeFriends = function () {
            var gameData={};
            gameData.friendIds=getFriendIds(friends);
            gameData.tagIds=TAGS;
            gameFSM = new GameFSM(gameData, self, apolloSrv, state);
        };

        this.showResult = function (quizId) {

        };

        this.acceptChallenge = function (quizId) {
            var gameData={};
            gameData.quizId=quizId;
            console.log(quizId);
            gameFSM = new GameFSM(gameData, self, apolloSrv, state);
        };

        var getFriendIds = function (friends) {
            var friendIds = [];
            for (var i in friends) {
                var friend = friends[i];
                friendIds.push(friend.id);
            }
            return friendIds;
        };

    });