/**
 * Created by VanLinh on 7/23/2014.
 */
var app = angular.module('arena.challenge.controller', [
    'ui.router',
    'arena.audio.service',
    'arena.users.service',
    'arena.users.facebook.service',
    'arena.apollo.service',
    'arena.transfer.service',
    'arena.game.service'

]);

app.controller('arena.play.init-game.ctrl', function (gameFSM, gameSrv) {
//    gameSrv.getState().go("on-game");

});

app.controller('arena.play.on-game.ctrl',
    ['delegate', '$scope', '$state', '$http', '$timeout', 'userSrv', 'audioSrv', 'facebookSrv', 'apolloSrv', 'gameFSM',
        function (delegate, $scope, $state, $http, $timeout, userSrv, audioSrv, facebookSrv, apolloSrv, gameFSM) {
            var self = this;

            var quizMachine;
            var backgroundAudio;
            var countDownAudio;
            var countDownCoongAudio;
            var correctAnswerAudio;
            var wrongAnswerAudio;
            var countDownToZeroTimer;

            $scope.profile = userSrv.getProfile();
            console.log($scope.profile);

            //
            delegate.destroy = function () {
                $('#startModalChallenge').modal('hide');
                $('#finishModalChallenge').modal('hide');
                $('body').removeClass('modal-open');
                $('.modal-backdrop').remove();
                clearTimeout(countDownToZeroTimer);
                audioSrv.destroyAllSound();
                if (quizMachine) {
                    quizMachine.destroy();
                }
                delete quizMachine;

            };

            //
            //Show/hide bootstrap modal for checking answer
            $scope.showCheckCorrectAnswer = false;
            var _activeModal = function () {
                $timeout(function () {
                    $('#showCheckCorrectAnswer').modal('show');
                }, 200);
                $timeout(function () {
                    $('#showCheckCorrectAnswer').modal('hide');
                }, 1800);
            };

            //
            //show modal when startup challenge
            //
            var _countDownThreeToZero = function () {
                countDownToZeroTimer =
                    setTimeout(function () {
                        $scope.ThreeToZero--;
                        countDownAudio.play();
                        $scope.$apply();
                        if ($scope.ThreeToZero > 0) {
                            _countDownThreeToZero();
                        } else {
                            setTimeout(function () {
                                $scope.ThreeToZero = "Bắt đầu !";
                                countDownCoongAudio.play();
                                $scope.$apply();
                            }, 1000);
                        }
                    }, 1000);
            };
            var _startModalChallenge = function () {
                $('#startModalChallenge').modal('show');
                _countDownThreeToZero();
                setTimeout(function () {
                    $('#startModalChallenge').modal('hide');
                }, 5000);
            };
            //
            //
            $scope.clickAnswer = function (index) {
                var event = {};
                event.name = "question_answer";
                event.data = {answer: index};
                $scope.lastAnswered = index;
                quizMachine.consumeEvent(event);

            };
            //Get progresbar value
            $scope.getProgress = function () {
                return (($scope.countDown) / $scope.timeout * 100) + '%';
            };
            //play audio
            var _playAudio = function (url) {
                audioSrv.playAudio(url);
            };


            this.handleEventNotification = function (event) {
                console.log(event);

                switch (event.name) {

                    case "quiz_questioning":

                        backgroundAudio.play();
                        $scope.question = event.data.question;
                        $scope.timeout += event.data.timeout;
                        console.log("quiz_questioning");
                        console.log($scope.timeout);
                        break;
                    case "question_ending":
                        console.log("question_ending");
                        var index = $scope.lastAnswered;
                        var yourAnswer = "Sai";

                        if (event.data.correct) {
                            _activeModal();
                            correctAnswerAudio.play();
                            $scope.answers[index] = {correct: 1};
                            $scope.score += event.data.score;
                            $scope.results[$scope.currentQuestion] = {'score': '+' + event.data.score, 'correct': 1};
                            $scope.showCorrect = true;
                            yourAnswer = "Đúng";

                        } else {
                            wrongAnswerAudio.play();
                            $scope.answers[index] = {correct: 0};
                            $scope.results[$scope.currentQuestion] = {'score': '+' + event.data.score, 'correct': 0};

                        }
                        $scope.answers[event.data.correctAnswer] = {correct: 1};
                        $scope.lastAnswered = null;
                        $scope.$apply();
                        break;
                    case "question_answered":
                        console.log("Answered");
                        $scope.disabledButton = true;
                        break;
                    case "question_time_changed":
                        console.log(event.name, event.data.remainingTime);
                        $scope.countDown = event.data.remainingTime;
                        $scope.$apply();
                        break;
                    case "question_next_question":
                        console.log("next question");
                        $scope.currentQuestion++;
                        $scope.question = event.data.question;
                        $scope.answers = [];
                        $scope.disabledButton = false;
                        $scope.showCorrect = false;
                        break;
                    case "quiz_finished_event":
                        gameFSM.handleEventNotification({name: "quiz_finished", data: {result: event.data.result}});
                        mixpanel.track("Finished Quiz", {
                            "Score": $scope.score,
                            "Number of Answers": $scope.answers.length
                        });
                        break;
                    case "quiz_initializing":
                        break;

                }
            };

            var _initialize = function () {
                backgroundAudio = audioSrv.getBackgroundAudio("/data/sound/starting.mp3", 10);
                countDownAudio = audioSrv.getCountDownAudio("/data/sound/countdown.mp3");
                countDownCoongAudio = audioSrv.getCountDownCoongAudio("/data/sound/coong.mp3");
                correctAnswerAudio = audioSrv.getCorrectAnswerAudio("/data/sound/true-answer.mp3");
                wrongAnswerAudio = audioSrv.getWrongAnswerAudio("/data/sound/wrong-answer.mp3");

                $scope.results = [];
                $scope.answers = [];
                $scope.tableOfResults = [];
                //for post results
                $scope.score = 0;
                $scope.userAnswers = [];
                //
                $scope.currentQuestion = 0;
                $scope.timeout = 0;
                $scope.ThreeToZero = 3;
                $scope.disabledButton = false;

                quizMachine = new QuizStateMachine(gameFSM.quiz, self);
                $scope.numberOfQuestion = quizMachine.quiz.questions.length;
                for (var i = 0; i < $scope.numberOfQuestion; i++) {
                    $scope.results.push({'score': i + 1, 'correct': null});
                }
                _startModalChallenge();

            };
            _initialize();

            $scope.takeSurvey = function () {
                mixpanel.track("Take Survey", {
                    "View": "Result"
                });

            }

        }]);


app.controller('arena.play.result.ctrl', function ($scope, gameSrv, gameFSM) {
    $scope.results = gameFSM.result;

    $scope.medalUrl = "";
    if ($scope.results.point >= 220) {
        $scope.medalUrl = "/data/image/gold-medal.png";
    } else if ($scope.results.point >= 160) {
        $scope.medalUrl = "/data/image/silver-medal.png";
    } else if ($scope.results.point > 90) {
        $scope.medalUrl = "/data/image/bronze-medal.png";
    } else {
        $scope.medalUrl = "";
    }

    $scope.backHome = function () {
        $scope.results = null;
        $scope.medalUrl = null;
        gameFSM.handleEventNotification({name: "result_finished", data: {}});
        gameFSM=null;
        gameSrv.destroy();

    }

});

app.controller('arena.play.finished.ctrl', function (gameFSM, gameSrv) {

});

//app.controller('arena.challenge.ctrl',
//    ['delegate', '$scope', '$state', '$http', '$timeout', 'userSrv', 'audioSrv', 'facebookSrv', 'apolloSrv', 'transferSrv',
//        function (delegate, $scope, $state, $http, $timeout, userSrv, audioSrv, facebookSrv, apolloSrv, transferSrv) {
//            var self = this;
//
//            var quizMachine;
//            var backgroundAudio;
//            var countDownAudio;
//            var countDownCoongAudio;
//            var correctAnswerAudio;
//            var wrongAnswerAudio;
//            var countDownToZeroTimer;
//            var modalFinishChallengeTimer;
//
//            $scope.medalUrl;
//            $scope.profile = userSrv.getProfile();
//            console.log($scope.profile);
//
//            //
//            delegate.destroy = function () {
//                $('#startModalChallenge').modal('hide');
//                $('#finishModalChallenge').modal('hide');
//                $('body').removeClass('modal-open');
//                $('.modal-backdrop').remove();
//                clearTimeout(modalFinishChallengeTimer);
//                clearTimeout(countDownToZeroTimer);
//                audioSrv.destroyAllSound();
//                if (quizMachine) {
//                    quizMachine.destroy();
//                }
//                delete quizMachine;
//
//            };
//
//            //
//            //Show/hide bootstrap modal for checking answer
//            $scope.showCheckCorrectAnswer = false;
//            var _activeModal = function () {
//                $timeout(function () {
//                    $('#showCheckCorrectAnswer').modal('show');
//                }, 200);
//                $timeout(function () {
//                    $('#showCheckCorrectAnswer').modal('hide');
//                }, 1800);
//            };
//
//            //
//            //show modal when startup challenge
//            //
//            var _countDownThreeToZero = function () {
//                countDownToZeroTimer =
//                    setTimeout(function () {
//                        $scope.ThreeToZero--;
//                        countDownAudio.play();
//                        $scope.$apply();
//                        if ($scope.ThreeToZero > 0) {
//                            _countDownThreeToZero();
//                        } else {
//                            setTimeout(function () {
//                                $scope.ThreeToZero = "Bắt đầu !";
//                                countDownCoongAudio.play();
//                                $scope.$apply();
//                            }, 1000);
//                        }
//                    }, 1000);
//            };
//            var _startModalChallenge = function () {
//                $('#startModalChallenge').modal('show');
//                _countDownThreeToZero();
//                setTimeout(function () {
//                    $('#startModalChallenge').modal('hide');
//                }, 5000);
//            };
//            //
//            //
//            $scope.clickAnswer = function (index) {
//                var event = {};
//                event.name = "question_answer";
//                event.data = {answer: index};
//                $scope.lastAnswered = index;
//                quizMachine.consumeEvent(event);
//
//            };
//            //Get progresbar value
//            $scope.getProgress = function () {
//                return (($scope.countDown) / $scope.timeout * 100) + '%';
//            };
//            //play audio
//            var _playAudio = function (url) {
//                audioSrv.playAudio(url);
//            };
//
//            //Reload Challenge
//            $scope.reloadChallenge = function () {
//
//                mixpanel.track("Play Again", {
//                    "View": "Result"
//                });
//
//                delegate.destroy();
//                _initialize();
//
//            };
//
//
//            this.handleEventNotification = function (event) {
//                console.log(event);
//
//                switch (event.name) {
//
//                    case "quiz_questioning":
//
//                        backgroundAudio.play();
//                        $scope.question = event.data.question;
//                        $scope.timeout += event.data.timeout;
//                        console.log("quiz_questioning");
//                        console.log($scope.timeout);
//                        break;
//                    case "question_ending":
//                        console.log("question_ending");
//                        var index = $scope.lastAnswered;
//                        var yourAnswer = "Sai";
//
//                        if (event.data.correct) {
//                            _activeModal();
//                            correctAnswerAudio.play();
//                            $scope.answers[index] = {correct: 1};
//                            $scope.score += event.data.score;
//                            $scope.results[$scope.currentQuestion] = {'score': '+' + event.data.score, 'correct': 1};
//                            $scope.showCorrect = true;
//                            yourAnswer = "Đúng";
//
//                        } else {
//                            wrongAnswerAudio.play();
//                            $scope.answers[index] = {correct: 0};
//                            $scope.results[$scope.currentQuestion] = {'score': '+' + event.data.score, 'correct': 0};
//
//                        }
//                        $scope.answers[event.data.correctAnswer] = {correct: 1};
//                        var tableResult = {'yourAnswer': yourAnswer};
//                        $scope.tableOfResults.push(tableResult);
//                        $scope.lastAnswered = null;
//                        $scope.$apply();
//                        break;
//                    case "question_answered":
//                        console.log("Answered");
//
//                        $scope.disabledButton = true;
//
//                        break;
//                    case "question_time_changed":
//                        console.log(event.name, event.data.remainingTime);
//                        $scope.countDown = event.data.remainingTime;
//                        $scope.$apply();
//                        break;
//                    case "question_next_question":
//                        console.log("next question");
//                        $scope.currentQuestion++;
//                        $scope.question = event.data.question;
//                        $scope.answers = [];
//                        $scope.disabledButton = false;
//                        $scope.showCorrect = false;
//                        break;
//                    case "quiz_finished_event":
//                        console.log("quiz_finished");
//                        console.log(event.data.quizID);
//                        console.log(JSON.stringify(event.data.result));
//                        apolloSrv.postQuizResults(event.data.quizID, event.data.result, function (data) {
//
//                        });
//
//
//                        //
//                        if ($scope.score >= 160) {
//                            $scope.medalUrl = "/data/image/gold-medal.png";
//                        } else if ($scope.score >= 130) {
//                            $scope.medalUrl = "/data/image/silver-medal.png";
//                        } else if ($scope.score > 100) {
//                            $scope.medalUrl = "/data/image/bronze-medal.png";
//                        } else {
//                            $scope.medalUrl = "";
//                        }
//                        modalFinishChallengeTimer = $timeout(function () {
//                            $('#finishModalChallenge').modal('show');
//                        }, 1000);
//
//
//                        mixpanel.track("Finished Quiz", {
//                            "Score": $scope.score,
//                            "Number of Answers": $scope.answers.length
//                        });
//
//
//                        break;
//                    case "quiz_initializing":
//                        break;
//
//                }
//            };
//            $scope.exitChallenge = function () {
//                $state.go("main");
//
//                mixpanel.track("Go to MainView", {
//                    "View": "Result"
//                });
//
//            };
//            var _initialize = function () {
//                backgroundAudio = audioSrv.getBackgroundAudio("/data/sound/starting.mp3", 10);
//                countDownAudio = audioSrv.getCountDownAudio("/data/sound/countdown.mp3");
//                countDownCoongAudio = audioSrv.getCountDownCoongAudio("/data/sound/coong.mp3");
//                correctAnswerAudio = audioSrv.getCorrectAnswerAudio("/data/sound/true-answer.mp3");
//                wrongAnswerAudio = audioSrv.getWrongAnswerAudio("/data/sound/wrong-answer.mp3");
//
//                $scope.results = [];
//                $scope.answers = [];
//                $scope.tableOfResults = [];
//                //for post results
//                $scope.score = 0;
//                $scope.userAnswers = [];
//                //
//                $scope.currentQuestion = 0;
//                $scope.timeout = 0;
//                $scope.ThreeToZero = 3;
//                $scope.disabledButton = false;
////            $http.get('/data/myData.json').success(function (data) {
////
////                var questions = generateQuestions(data, numOfQuestions);
////                quizMachine = new QuizStateMachine(questions, self);
////                $scope.numberOfQuestion = quizMachine.quiz.questions.length;
////                for (var i = 0; i < $scope.numberOfQuestion; i++) {
////                    $scope.results.push({'score': i + 1, 'correct': null});
////                }
////                _startModalChallenge();
////            });
//
//                apolloSrv.createNewQuiz(transferSrv.getOpponentIDs(), transferSrv.getTags(), function (quiz) {
//                    console.log("Opponent IDs : " + transferSrv.getOpponentIDs())
//                    quizMachine = new QuizStateMachine(quiz, self);
//                    $scope.numberOfQuestion = quizMachine.quiz.questions.length;
//                    for (var i = 0; i < $scope.numberOfQuestion; i++) {
//                        $scope.results.push({'score': i + 1, 'correct': null});
//                    }
//                    _startModalChallenge();
//                });
//
//
//                var generateQuestions = function (data, numberOfQuestion) {
//                    var questions = [];
//                    var indexes = [];
//                    var n = data.length;
//                    while (questions.length < numberOfQuestion) {
//                        var rand = Math.random() * 1000;
//                        var i = Math.floor(rand % n);
//                        if (indexes.indexOf(i) < 0) {
//                            questions.push(data[i]);
//                            indexes.push(i);
//                        }
//                    }
//                    return questions;
//                };
//
//            };
//            _initialize();
//
//            $scope.takeSurvey = function () {
//                mixpanel.track("Take Survey", {
//                    "View": "Result"
//                });
//
//            }
//
//        }]);
