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
        $scope.answers=[];
        $scope.score=0;
        $scope.currentQuestion=1;
        $scope.profile=userSrv.getProfile();
        $scope.clickAnswer = function (index) {
            var event = {};
            event.name = "question_answer";
            event.data = {answer:index};
            $scope.lastAnswered=index;
            quizMachine.consumeEvent(event);

        };
        this.fireStateChanged = function (event) {
            console.log(event);

            switch (event.name) {
                case "quiz_questioning":
                    $scope.question = event.data;
                    console.log("quiz_questioning");
                    break;
                case "question_answered":
                    console.log("Answered");
                    //$scope.question = event.data;
                    //alert(event.data.correct);
                    if(event.data.correct){
                        $scope.answers[$scope.lastAnswered]=1;
                        $scope.score+=event.data.score;

                    }else{
                        $scope.answers[$scope.lastAnswered]=0;
                    }
                    //$scope.answers[$scope.lastAnswered] = (event.data.correct)?1:0;
                    break;
                case "question_time_changed":
                    console.log(event.name, event.data.remainingTime);
                    $scope.countDown = event.data.remainingTime;
                    $scope.$apply();
                    break;
                case "question_next_question":
                    $scope.currentQuestion++;
                    $scope.question=event.data;
                    $scope.answers=[];
                    break;
            }
        };

        $http.get('/data/myData.json').success(function (data) {
            quizMachine = new QuizStateMachine(data.slice(75,85), self);

        });

    });