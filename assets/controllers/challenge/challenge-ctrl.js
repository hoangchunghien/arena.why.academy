/**
 * Created by VanLinh on 7/23/2014.
 */
angular.module('arena.challenge.controller', [
    'ui.router',

    'arena.users.service'

])
    .controller('arena.challenge.ctrl', function ($scope, $http, userSrv) {

        var self = this;
        var quizMachine;
        $scope.results=[{},{},{},{},{},{},{},{},{},{}];
        $scope.answers=[];
        $scope.score=0;
        $scope.currentQuestion=0;
        $scope.timeout=0;
        $scope.profile=userSrv.getProfile();
        //disabled button
        $scope.disabledButton=false;
        $scope.showCorrect=false;
        //
        $scope.clickAnswer = function (index) {
            var event = {};
            event.name = "question_answer";
            event.data = {answer:index};
            $scope.lastAnswered=index;
            quizMachine.consumeEvent(event);

        };
        this.handleEventNotification = function (event) {
            console.log(event);

            switch (event.name) {
                case "quiz_questioning":
                    $scope.question = event.data.question;
                    $scope.timeout+=event.data.timeout;
                    console.log("quiz_questioning");
                    console.log($scope.timeout);
                    break;
                case "question_ending":
                    console.log("question_ending");
                    var index=$scope.lastAnswered;

                    if(event.data.correct){
                        $scope.answers[index]={correct:1};
                        $scope.score+=event.data.score;
                        $scope.results[$scope.currentQuestion]={'score':event.data.score, 'correct':1};
                        $scope.showCorrect=true;

                    }else{
                        $scope.answers[index]={correct:0};
                        $scope.results[$scope.currentQuestion]={'score':event.data.score, 'correct':0};

                    }
                    $scope.$apply();
                    $scope.answers[event.data.correctAnswer]={correct:1};
                    break;
                case "question_answered":
                    console.log("Answered");

                    $scope.disabledButton=true;

                    break;
                case "question_time_changed":
                    console.log(event.name, event.data.remainingTime);
                    $scope.countDown = event.data.remainingTime;
                    $scope.$apply();
                    break;
                case "question_next_question":
                    console.log("next question");
                    $scope.currentQuestion++;
                    $scope.question=event.data.question;
                    $scope.answers=[];
                    $scope.disabledButton=false;
                    $scope.showCorrect=false;
                    break;
            }
        };

        $http.get('/data/myData.json').success(function (data) {
            quizMachine = new QuizStateMachine(data.slice(33,43), self);
        });
        $scope.getProgress=function(){
          return (($scope.countDown)/$scope.timeout*100)+'%';
        };


    });