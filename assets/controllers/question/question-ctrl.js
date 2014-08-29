/**
 * Created by VanLinh on 8/18/2014.
 */

var app = angular.module('arena.question.controller', [
    'ui.router',
    'arena.audio.service',
    'arena.users.service',
    'arena.users.facebook.service',
    'arena.apollo.service',
    'arena.transfer.service',
    'arena.game.service'

]);
app.controller('arena.question.ctrl', [ '$scope', '$state', '$http', 'userSrv', 'audioSrv', 'facebookSrv', 'apolloSrv', 'transferSrv', 'gameSrv',
    function ($scope, $state, $http, userSrv, audioSrv, facebookSrv, apolloSrv, transferSrv, gameSrv) {

        $scope.newQuestion={};
        $scope.question={};
        $scope.question.questionContent="";
        $scope.question.answers=["0","1","2","3"];
        $scope.question.difficultyLevels=["1","2","3","4","5","6","7","8","9","10"];
        $scope.question.questionTags=["1","2","3","4","5","6","7","8","9","10","11","12","13","14"];

        var validateQuestionContent=function(){
            if($scope.question.questionContent==null || $scope.question.questionContent==""){
                return false;
            }
            return true;
        };

        $scope.questionContentChange=function(){
            if(validateQuestionContent()==false){
                $('#questionContent').css({
                    "border-color":"red !important"
                });
            }else{
                $('#questionContent').css({
                    "border-color":"green !important"
                });
            }
        };

        var validateQuestionTags=function(){
            var questionTags=[];
            $(':checkbox').each(function() {
                if($(this).is(":checked")){
                    questionTags.push($(this).val());
                }
            });
            if(questionTags.length){
                return true;
            }else{
                return false;
            }
        };


        $scope.postQuestion=function(){
            if(validateQuestionContent()==false){
                alert("Please, fill in Question Content !");
                return;
            }
            if(validateQuestionTags()==false){
                alert("Please, fill in Multi Tags !");
                return;
            }

            var str=$scope.question.questionContent;
            var correctAnswer=$('#correctAnswer').val();
            var difficulty_level=$('#difficultyLevel').val();
            var questionTags = [];
            $(':checkbox').each(function() {
                if($(this).is(":checked")){
                    questionTags.push($(this).val());
                }
            });

            var questions=[];
            var question={};

            question.question=JSON.stringify({"text":str.substring(0,str.indexOf("(A)")-1)});
            question.answer=correctAnswer;
            question.content=JSON.stringify({
                "choices":[
                    {"text":str.substring(str.indexOf("(A)")+3,str.indexOf("(B)")-1)},
                    {"text":str.substring(str.indexOf("(B)")+3,str.indexOf("(C)")-1)},
                    {"text":str.substring(str.indexOf("(C)")+3,str.indexOf("(D)")-1)},
                    {"text":str.substring(str.indexOf("(D)")+3,str.length)}
                ]
            });
            question.type="multichoice";
            question.difficulty_level=parseInt(difficulty_level);
            question.links={
                "tags":questionTags
            }
            questions.push(question);
            var data={"questions":questions};

            apolloSrv.postQuestion(data, function (data) {
                console.log(data);
            });


        };

    }]);
app.controller('arena.question-audio.ctrl', [ '$scope', '$state', '$http', 'userSrv', 'audioSrv', 'facebookSrv', 'apolloSrv', 'transferSrv', 'gameSrv',
    function ($scope, $state, $http, userSrv, audioSrv, facebookSrv, apolloSrv, transferSrv, gameSrv) {

        $scope.newQuestion={};
        $scope.question={};
        $scope.question.questionPictureUrl="";
        $scope.question.questionAudioUrl="";
        $scope.question.numberOfAnswers=[3,4];
        $scope.question.answers=["0","1","2","3"];
        $scope.question.difficultyLevels=["1","2","3","4","5","6","7","8","9","10"];
        $scope.question.questionTags=["1","2","3","4","5","6","7","8","9","10","11","12","13","14"];

        var validateQuestionPictureUrl=function(){
            if($scope.question.questionPictureUrl==null || $scope.question.questionPictureUrl==""){
                return false;
            }
            return true;
        };

        $scope.questionPictureUrlChange=function(){
            if(validateQuestionPictureUrl()==false){
                $('#questionPicture').css({
                    "border-color":"red !important"
                });
            }else{
                $('#questionPicture').css({
                    "border-color":"green !important"
                });
            }
        };
        var validateQuestionAudioUrl=function(){
            if($scope.question.questionAudioUrl==null || $scope.question.questionAudioUrl==""){
                return false;
            }
            return true;
        };

        $scope.questionAudioUrlChange=function(){
            if(validateQuestionAudioUrl()==false){
                $('#questionAudio').css({
                    "border-color":"red !important"
                });
            }else{
                $('#questionAudio').css({
                    "border-color":"green !important"
                });
            }
        };

        var validateQuestionTags=function(){
            var questionTags=[];
            $(':checkbox').each(function() {
                if($(this).is(":checked")){
                    questionTags.push($(this).val());
                }
            });
            if(questionTags.length){
                return true;
            }else{
                return false;
            }
        };


        $scope.postQuestion=function(){
//            if(validateQuestionPictureUrl()==false){
//                alert("Please, fill in Question Picture Url !");
//                return;
//            }
            if(validateQuestionAudioUrl()==false){
                alert("Please, fill in Question Audio Url !");
                return;
            }
            if(validateQuestionTags()==false){
                alert("Please, fill in Multi Tags !");
                return;
            }

            var pictureUrl=$scope.question.questionPictureUrl;
            var audioUrl=$scope.question.questionAudioUrl;
            var numberOfAnswers=$('#numberOfAnswers').val();
            var correctAnswer=$('#correctAnswer').val();
            var difficulty_level=$('#difficultyLevel').val();
            var questionTags = [];
            $(':checkbox').each(function() {
                if($(this).is(":checked")){
                    questionTags.push($(this).val());
                }
            });

            var questions=[];
            var question={};

            question.question=JSON.stringify({
                "picture_url": pictureUrl,
                "audio_url":audioUrl
            });
            question.answer=correctAnswer;
            if(numberOfAnswers==4){
                question.content=JSON.stringify({
                    "choices":[
                        {"text":""},
                        {"text":""},
                        {"text":""},
                        {"text":""}
                    ]
                });
            }else if(numberOfAnswers==3){
                question.content=JSON.stringify({
                    "choices":[
                        {"text":""},
                        {"text":""},
                        {"text":""}
                    ]
                });
            }

            question.type="multichoice";
            question.difficulty_level=parseInt(difficulty_level);
            question.links={
                "tags":questionTags
            }
            questions.push(question);
            var data={"questions":questions};

            console.log(data);
            apolloSrv.postQuestion(data, function (data) {
                console.log(data);
            });


        };

    }]);