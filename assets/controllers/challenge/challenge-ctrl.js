/**
 * Created by VanLinh on 7/23/2014.
 */


///////
var app = angular.module('arena.challenge.controller', [
    'ui.router',
    'arena.audio.service',
    'arena.users.service',
    'arena.users.facebook.service',
    'arena.apollo.service',
    'arena.transfer.service',
    'arena.game.service'

]);

app.controller('arena.play.init-game.ctrl', ['$scope', '$state', 'audioSrv', 'apolloSrv', 'gameFSM',
    function ($scope, $state, audioSrv, apolloSrv, gameFSM) {
//    gameSrv.getState().go("on-game");

        $scope.gameData = gameFSM.gameData;

    }]);

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

            $scope.gameData = gameFSM.gameData;

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
                            //$scope.score += event.data.score;
                            gameFSM.myResult.point += event.data.score;

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

                        gameFSM.myResult.user_answers = event.data.result.user_answers;
                        gameFSM.handleEventNotification({name: "quiz_finished", data: {}});
                        ApolloAnalytics.track("Finished Quiz", {
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

                gameFSM.myResult.point = 0;

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
                ApolloAnalytics.track("Take Survey", {
                    "View": "Result"
                });

            }

        }]);


app.controller('arena.play.result.ctrl', ['$scope', 'gameSrv', 'gameFSM', 'userSrv',
    function ($scope, gameSrv, gameFSM, userSrv) {

        $scope.profile = userSrv.getProfile();
        $scope.myResult = gameFSM.myResult;
        $scope.quiz = gameFSM.gameData.quiz;


        // $scope.myResult.user = $scope.profile;
        $scope.medalUrl = "";

        $scope.friendResult = {};
        $scope.gameData = gameData = gameFSM.gameData;


        $scope.user = null;
        $scope.opponent = null;
        $scope.userWinOrLose=-1;

        var checkUserWinOrLose=function(){
            // Check if data is available
            if (!$scope.user || !$scope.opponent) return;
            if (!$scope.user.result || !$scope.opponent.result) return;
            if (!$scope.user.result.point || !$scope.opponent.result.point) return;


            $scope.userWinOrLose=0;

            if($scope.user.result.point==$scope.opponent.result.point){
                $scope.userWinOrLose=1;
            }
            else if($scope.profile.id==$scope.user.id && $scope.user.result.point>$scope.opponent.result.point){
                $scope.userWinOrLose=2;
            }else  if($scope.profile.id==$scope.opponent.id && $scope.opponent.result.point>$scope.user.result.point){
                $scope.userWinOrLose=2;
            }
            console.log($scope.userWinOrLose);
        }

        var _prepareData = function () {

            // prepareQuizResult(gameData);

            $scope.user = gameData.players.user;
            $scope.opponent = gameData.players.opponent;

            checkUserWinOrLose();

            for (var i = $scope.user.result.user_answers.length - 1; i >= 0; i--) {
                var userAnswer = $scope.user.result.user_answers[i];
                userAnswer.isCorrected = isUserAnswerCorrect(userAnswer);
            }
            ;


            if ($scope.opponent.result) {
                for (var i = $scope.opponent.result.user_answers.length - 1; i >= 0; i--) {
                    var userAnswer = $scope.opponent.result.user_answers[i];
                    userAnswer.isCorrected = isUserAnswerCorrect(userAnswer);
                }
                ;
            }
            ;


            if ($scope.user.id == $scope.profile.id) {
                prepareMedal($scope.user.result);
            } else if ($scope.opponent.id == $scope.profile.id) {
                prepareMedal($scope.opponent.result);
            };
        }


        var prepareMedal = function (result) {

            if (result.point >= 220) {
                $scope.medalUrl = "/data/image/gold-medal.png";
            } else if (result.point >= 160) {
                $scope.medalUrl = "/data/image/silver-medal.png";
            } else if (result.point > 90) {
                $scope.medalUrl = "/data/image/bronze-medal.png";
            } else {
                $scope.medalUrl = "";
            }
        }


        $scope.backHome = function () {
            $scope.results = null;
            $scope.medalUrl = null;
            gameSrv.getState().go("home");
//        gameFSM.handleEventNotification({name: "result_finished", data: {}});
            gameFSM = null;
            gameSrv.destroy();

        }

        var questionForUserAnswer = function (userAnswer) {
            for (var i = gameData.questions.length - 1; i >= 0; i--) {
                var question = gameData.questions[i];
                if (question.id == userAnswer.question_id) {
                    return question;
                }
                ;
            }
        };

        var playerWithID = function (userID) {

        }


        var isUserAnswerCorrect = function (userAnswer) {

            if (!userAnswer) return false;

            var question = questionForUserAnswer(userAnswer);
            if (question.answer == userAnswer.user_answer) {
                return true;
            } else {
                return false;
            }
        };


        $scope.stringForAnsweringTime = function (time) {
            var timeString = (time/1000).toFixed(1).replace(/\.0$/, '');;
            return timeString + 's';
        }

        _prepareData();

    }]);

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
//                ApolloAnalytics.track("Play Again", {
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
//                        ApolloAnalytics.track("Finished Quiz", {
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
//                ApolloAnalytics.track("Go to MainView", {
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
//                ApolloAnalytics.track("Take Survey", {
//                    "View": "Result"
//                });
//
//            }
//
//        }]);
