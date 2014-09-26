angular.module('arena.game.service', [

])
    .service('gameSrv', function (apolloSrv, $state) {

        var self = this;
        var TAGS = ['1','4'];

        var state = $state;

        this.setState = function (value) {
            state = value;
        };

        this.getState = function () {
            return state;
        };

        var gameFSM = null;
        var gameData = null;
        var tags = null;

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
            gameData.friendIds = getFriendIds(gameData.friends);
            if(self.tags){
                gameData.tagIds = self.tags;
            }

            gameFSM = new GameFSM(gameData, self, apolloSrv, state);
            gameFSM.startup();
        };

        this.showResult = function (quizID) {
//            gameFSM = new GameFSM(gameData, self, apolloSrv, state);
//
//            apolloSrv.getQuiz(quizID, "players,results,questions", function (quiz) {
//                gameFSM.gameData.results = quiz.results;
//                gameFSM.gameData.players = quiz.players;
//                gameFSM.gameData.questions = quiz.questions;
////                state.go('result');
////                state.go('result',{quizID:quizID});
//                // callback display
//
//            });
            state.go('result',{quizID:quizID});
        };
        this.prepareForShowingResult = function (quizID, callback) {
            gameFSM = new GameFSM(gameData, self, apolloSrv, state);

            apolloSrv.getQuiz(quizID, "players,results,questions", function (quiz) {
                gameFSM.gameData.results = quiz.results;
                gameFSM.gameData.players = quiz.players;
                gameFSM.gameData.questions = quiz.questions;
//                state.go('result');
//                state.go('result',{quizID:quizID});
                // callback display
                callback();
            });
        };

        this.acceptChallenge = function (quizID) {
            gameData.quizID = quizID;
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