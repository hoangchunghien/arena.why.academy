/**
 * Created by VanLinh on 7/23/2014.
 */
var app = angular.module('arena.challenge.controller', [
    'ui.router',
    'arena.audio.service',
    'arena.users.service'

]);
app.controller('arena.challenge.ctrl', function (delegate, $scope, $state, $http, $timeout, userSrv, audioSrv) {

    var self = this;
    var quizMachine;
    var backgroundAudio = audioSrv.getBackgroundAudio("/data/sound/starting.mp3", 10);
    var countDownAudio = audioSrv.getCountDownAudio("/data/sound/countdown.mp3");
    var countDownCoongAudio = audioSrv.getCountDownCoongAudio("/data/sound/coong.mp3");
    var correctAnswerAudio = audioSrv.getCorrectAnswerAudio("/data/sound/true-answer.mp3");
    var wrongAnswerAudio = audioSrv.getWrongAnswerAudio("/data/sound/wrong-answer.mp3");
    var countDownToZeroTimer;
    $scope.results = [];
    $scope.answers = [];
    $scope.tableOfResults = [];
    $scope.score = 0;
    $scope.currentQuestion = 0;
    $scope.timeout = 0;
    $scope.ThreeToZero = 3;
    $scope.startModalChallenge = false;
    $scope.finishedModalChallenge = false;
    $scope.medalUrl;
    $scope.profile = userSrv.getProfile();
    //disabled button
    $scope.disabledButton = false;


    //
    delegate.destroy = function () {
        $('#startModalChallenge').modal('hide');
        $('body').removeClass('modal-open');
        $('.modal-backdrop').remove();
        clearTimeout(countDownToZeroTimer);
        audioSrv.destroyAllSound();
        quizMachine.destroy();
        delete quizMachine;

    };

    //
    //Show/hide bootstrap modal for checking answer
    $scope.showCheckCorrectAnswer = false;
    var _activeModal = function () {
        $timeout(function () {
            $scope.showCheckCorrectAnswer = true;
        }, 200);
        $timeout(function () {
            $scope.showCheckCorrectAnswer = false;
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
                        $scope.ThreeToZero = "Let's go !";
                        countDownCoongAudio.play();
                        $scope.$apply();
                    }, 1000);
                }
            }, 1000);
//        clearTimeout(countDownToZeroTimer);
    };
    var _startModalChallenge = function () {
        $('#startModalChallenge').modal('show');
//        $scope.startModalChallenge = true;
        _countDownThreeToZero();
        setTimeout(function () {
//            $scope.startModalChallenge = false;
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
    //Reload Challenge
    $scope.reloadChallenge = function () {
        location.reload();
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

                if (event.data.correct) {
                    _activeModal();
                    correctAnswerAudio.play();
                    $scope.answers[index] = {correct: 1};
                    $scope.score += event.data.score;
                    $scope.results[$scope.currentQuestion] = {'score': '+' + event.data.score, 'correct': 1};
                    $scope.showCorrect = true;


                } else {
                    wrongAnswerAudio.play();
                    $scope.answers[index] = {correct: 0};
                    $scope.results[$scope.currentQuestion] = {'score': '+' + event.data.score, 'correct': 0};

                }
                $scope.answers[event.data.correctAnswer] = {correct: 1};
                var tableResult = {'yourAnswer': $scope.lastAnswered, 'correctAnswer': event.data.correctAnswer};
                $scope.tableOfResults.push(tableResult);
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
                console.log("quiz_finished");
//                $scope.finishedModalChallenge=true;
//                console.log($scope.finishedModalChallenge);
                //
                if ($scope.score >= 160) {
                    $scope.medalUrl = "/data/image/gold-medal.png";
                } else if ($scope.score >= 130) {
                    $scope.medalUrl = "/data/image/silver-medal.png";
                } else if ($scope.score > 100) {
                    $scope.medalUrl = "/data/image/bronze-medal.png";
                } else {
                    $scope.medalUrl = "";
                }
                $timeout(function () {
                    $scope.finishedModalChallenge = true;
                }, 1000);
//                $timeout(function () {
//                    $scope.finishedModalChallenge = false;
//                }, 5000);
                //
                break;
            case "quiz_initializing":
                _startModalChallenge();
                break;

        }
    };
    $scope.exitChallenge = function () {

        $state.go("main");

    };


    $http.get('/data/myData.json').success(function (data) {
//            quizMachine = new QuizStateMachine(data.slice(101,111), self);
        var x = Math.floor((Math.random() * 100) + 0);
        quizMachine = new QuizStateMachine(data.slice(x, x + 10), self);
        $scope.numberOfQuestion = quizMachine.quiz.questions.length;
        for (var i = 0; i < $scope.numberOfQuestion; i++) {
            $scope.results.push({'score': i + 1, 'correct': null});
        }
    });
    var destroyAllAudio = function () {
        audioSrv.destroySound('backgroundAudio');
        audioSrv.destroySound('countDownAudio');
        audioSrv.destroySound('countDownCoongAudio');
        audioSrv.destroySound('wrongAnswerAudio');
        audioSrv.destroySound('correctAnswerAudio');
    };


});
app.directive("modalShow", function ($parse) {
    return {
        restrict: "A",
        link: function (scope, element, attrs) {

            //Hide or show the modal
            scope.showModal = function (visible, elem) {
                if (!elem)
                    elem = element;

                if (visible)
                    $(elem).modal("show");
                else
                    $(elem).modal("hide");
            }

            //Watch for changes to the modal-visible attribute
            scope.$watch(attrs.modalShow, function (newValue, oldValue) {
                scope.showModal(newValue, attrs.$$element);
            });

            //Update the visible value when the dialog is closed through UI actions (Ok, cancel, etc.)
            $(element).bind("hide.bs.modal", function () {
                $parse(attrs.modalShow).assign(scope, false);
                if (!scope.$$phase && !scope.$root.$$phase)
                    scope.$apply();
            });
        }

    };
});