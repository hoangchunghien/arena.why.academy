/**
 * Created by hoang_000 on 8/11/2014.
 */

function GameFSM(gameData, gameSrv, apolloSrv, $state) {
    var self = this;
    var quizId = null;
    var quiz = {};
    var result = {};

    this.gameData = gameData;

    this.startup = function () {
        self.currentState = self.states['initGame'];
        self.currentState.run();
    };


    this.states = {
        initGame: {
            name: 'init-game',
            events: {
                on_game_event: 'onGame'
            },
            run: function () {
                $state.go("init-game");
                if (gameData.friendIds) {
                    apolloSrv.createNewQuiz(gameData.friendIds, gameData.tagIds, function (quiz) {
                        self.quizId = quiz.id;
                        self.quiz = quiz;
                        self.consumeEvent({name: 'on_game_event', data: {}});
                    });
                } else {
                    apolloSrv.getQuiz(gameData.quizId,"players,results,questions", function (quiz) {
                        self.quizId = quiz.id;
                        self.quiz = quiz;
                        self.consumeEvent({name: 'on_game_event', data: {}});
                    });
                }


            }
        },
        onGame: {
            name: 'on-game',
            events: {
                result_event: 'result'
            },
            run: function () {
                $state.go("on-game");

            }
        },
        result: {
            name: 'result',
            events: {
                finished_event: "finished"
            },
            run: function () {
                $state.go("result");
                console.log(self.quizId);
                console.log(JSON.stringify(self.result));
                apolloSrv.postQuizResults(self.quizId, self.result, function (data) {
                    console.log(data);
                });

            }
        },
        finished: {
            name: 'finished',
            events: {

            },
            run: function () {
                $state.go("home");
            }
        }
    };

    GameFSM.prototype.consumeEvent = function (event) {

        var self = this;
        var name = event.name;
        var data = event.data;
        var nextState = self.currentState.events[name];

        if (nextState) {
            self.currentState = self.states[nextState];
            self.currentState.run();
        }
    };

    GameFSM.prototype.handleEventNotification = function (event) {
        var self = this;
        switch (event.name) {
            case "quiz_finished":
                console.log("quiz_finished");
                self.result = event.data.result;
                self.gameData.myResult = event.data.result;
                self.consumeEvent({name: 'result_event', data: {}});
                break;
            case "result_finished":
                console.log("result_finished");
                self.consumeEvent({name: 'finished_event', data: {}});
                break;

        }
    };


    this.setGameData = function(data) {
        if (data.quiz) self.quiz = data.quiz;
    }

};