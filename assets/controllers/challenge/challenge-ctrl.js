/**
 * Created by VanLinh on 7/23/2014.
 */
var app = angular.module('arena.challenge.controller', [
    'ui.router',
    'arena.audio.service',
    'arena.users.service'

]);
app.controller('arena.challenge.ctrl', function ($scope,$state, $http, $timeout, userSrv, audioSrv) {

    var self = this;
    var quizMachine;
    var soundBackground=audioSrv.createAudio("/data/sound/starting.mp3",10);
    $scope.results=[];
    $scope.answers = [];
    $scope.tableOfResults=[];
    $scope.score = 0;
    $scope.currentQuestion = 0;
    $scope.timeout = 0;
    $scope.ThreeToZero=3;
    $scope.startChallenge=false;
    $scope.finishedChallenge=false;
    $scope.medalUrl;
    $scope.profile = userSrv.getProfile();
    //disabled button
    $scope.disabledButton = false;
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
    var _coundDownThreeToZero=function(){
//        setTimeout(function(){
//            $scope.ThreeToZero--;
//        },1000);
//        setTimeout(function(){
//            $scope.ThreeToZero--;
//        },2000);
//        setTimeout(function(){
//            $scope.ThreeToZero--;
//        },3000);
        $timeout(function () {
            $scope.ThreeToZero--;
            _playAudio("/data/sound/countdown.mp3");
        }, 1200);
        $timeout(function () {
            $scope.ThreeToZero--;
            _playAudio("/data/sound/countdown.mp3");
        }, 2200);
        $timeout(function () {
            $scope.ThreeToZero--;
            _playAudio("/data/sound/countdown.mp3");
        }, 3200);
        $timeout(function () {
            $scope.ThreeToZero="Let's go !";
            _playAudio("/data/sound/coong.mp3");
        }, 4200);

    };
    var _startChallenge=function(){
        $timeout(function () {
            $scope.startChallenge = true;
        }, 500);
        _coundDownThreeToZero();
        $timeout(function () {
            $scope.startChallenge = false;
        }, 5500);
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
    $scope.reloadChallenge=function(){
      location.reload();
    };
    this.handleEventNotification = function (event) {
        console.log(event);

        switch (event.name) {

            case "quiz_questioning":
//                _playAudio('/data/sound/starting.mp3');
                soundBackground.play();
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
                    _playAudio('/data/sound/true-answer.mp3');
                    $scope.answers[index] = {correct: 1};
                    $scope.score += event.data.score;
                    $scope.results[$scope.currentQuestion] = {'score': event.data.score, 'correct': 1};
                    $scope.showCorrect = true;


                } else {
                    _playAudio('/data/sound/wrong-answer.mp3');
                    $scope.answers[index] = {correct: 0};
                    $scope.results[$scope.currentQuestion] = {'score': event.data.score, 'correct': 0};

                }
                $scope.answers[event.data.correctAnswer] = {correct: 1};
                var tableResult={'yourAnswer': $scope.lastAnswered,'correctAnswer':event.data.correctAnswer};
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
//                $scope.finishedChallenge=true;
//                console.log($scope.finishedChallenge);
                //
                if($scope.score>=160){
                   $scope.medalUrl="/data/image/gold-medal.png";
                }else if($scope.score>=130)
                {
                    $scope.medalUrl="/data/image/silver-medal.png";
                }else if($scope.score>100){
                    $scope.medalUrl="/data/image/bronze-medal.png";
                }else{
                    $scope.medalUrl="";
                }
                $timeout(function () {
                    $scope.finishedChallenge = true;
                }, 1000);
//                $timeout(function () {
//                    $scope.finishedChallenge = false;
//                }, 5000);
                //
                break;
            case "quiz_initializing":
                _startChallenge();
                break;

        }
    };
    $scope.exitChallenge=function(){
        setTimeout(function(){
            soundBackground.destruct();
            $state.go("main");
        },1000)

    };


    $http.get('/data/myData.json').success(function (data) {
//            quizMachine = new QuizStateMachine(data.slice(101,111), self);
        var x = Math.floor((Math.random() * 100) + 0);
        quizMachine = new QuizStateMachine(data.slice(x, x + 10), self);
        $scope.numberOfQuestion=quizMachine.quiz.questions.length;
        for(var i=0; i<$scope.numberOfQuestion; i++){
            $scope.results.push({});
        }
    });


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