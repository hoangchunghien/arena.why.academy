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

        var gameFSM = null;
        var gameData = null;

        this.reset = function () {
            this.gameData = gameData = {};
            gameFSM = null;
        }

        self.reset();


        this.destroy = function () {
            self.reset();
            gameFSM = null;
        };



        this.getGameFSM = function () {
            return gameFSM;
        };

        this.challengeFriends = function () {
            gameData.friendIds=getFriendIds(gameData.friends);
            gameData.tagIds=TAGS;
            gameFSM = new GameFSM(gameData, self, apolloSrv, state);
            gameFSM.startup();
        };

        this.showResult = function (quizId) {
            gameFSM = new GameFSM(gameData, self, apolloSrv, state);

            apolloSrv.getQuiz(quizId,"players,results,questions", function (quiz) {
                gameFSM.gameData.results = quiz.results;
                gameFSM.gameData.players = quiz.players;
                gameFSM.gameData.questions = quiz.questions;
                state.go('result');
            });
        };

        this.acceptChallenge = function (quizId) {
            gameData.quizId=quizId;
            gameFSM = new GameFSM(gameData, self, apolloSrv, state);
            gameFSM.startup();
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