/**
 * Created by VanLinh on 8/18/2014.
 */

var app = angular.module('arena.question.controller', [
    'ui.router',
    'arena.audio.service',
    'arena.pictures.service',
    'arena.users.service',
    'arena.users.facebook.service',
    'arena.apollo.service',
    'arena.transfer.service',
    'arena.game.service'

]);

app.controller('arena.question.create.ctrl', [
    '$scope', '$state', '$http', 'userSrv', 'audioSrv', 'picturesSrv',
    function ($scope, $state, $http, userSrv, audioSrv, picturesSrv) {
        $scope.question = {};
        $scope.question.content = {};
        $scope.question.content.choices = [];
        $scope.question.tags = [];

        /*
         * For validated data, use this variable to tracking which question field had validated to prevent re-validate it
        * */
        $scope.validated = {};
        $scope.error = {};
        $scope.validated.question = {};
        $scope.error.question = {};
        $scope.validated.answer = {};
        $scope.error.answer = {};
        $scope.validated.answer.choices = [];
        $scope.error.answer.choices = [];
        $scope.enabled = {};
        $scope.enabled.btnSave = false;

        $scope.questionTextChanged = function () {
            $scope.validated.question.text = false;
        };

        $scope.questionPictureUrlChanged = function () {
            $scope.validated.question.pictureUrl = false;
        };

        $scope.questionAudioUrlChanged = function () {
            $scope.validated.question.audioUrl = false;
        };

        $scope.questionChoicesChanged = function (index) {
            $scope.validated.answer.choices[index] = false;
        };

        $scope.questionAnswerChanged = function () {
            $scope.validated.answer.correct = false;

            alert($scope.question.correct.text);
        };

        $scope.questionTagsChanged = function(tag) {
            alert($scope.question.tags);
        };

        // TODO load static tag from api server
        $scope.static = {};
        $scope.static.tags = [
            {
                id: "1",
                name: "toeic"
            },
            {
                id: "2",
                name: "ielts"
            },
            {
                id: "3",
                name: "toefl"
            },
            {
                id: "4",
                name: "grammar"
            },
            {
                id: "5",
                name: "reading"
            },
            {
                id: "6",
                name: "vocabulary"
            },
            {
                id: "7",
                name: "listening"
            },
            {
                id: "8",
                name: "very-easy"
            },
            {
                id: "9",
                name: "starter"
            },
            {
                id: "10",
                name: "developing"
            },
            {
                id: "11",
                name: "target"
            },
            {
                id: "12",
                name: "analyst"
            },
            {
                id: "13",
                name: "photographs"
            },
            {
                id: "14",
                name: "question-response"
            }
        ];

        var initialize = function () {
            $scope.question.content.choices = [
                {text: ''}
            ];
        };

        var validateData = function() {
            validateQuestionText();
            validateQuestionPictureUrl();
            validateQuestionAudioUrl();
            validateQuestionContent();
            validateQuestionAnswer();
            validateQuestionTags();
            switchSaveChangeButton();
        };

        var switchSaveChangeButton = function() {

        };

        var validateQuestionText = function() {

        };

        var validateQuestionPictureUrl = function() {

        };

        var validateQuestionAudioUrl = function() {

        };

        var validateQuestionContent = function() {

        };

        var validateQuestionAnswer = function() {

        };

        var validateQuestionTags = function() {

        };

        initialize();
    }
]);

app.controller('arena.question.ctrl', [ '$scope', '$state', '$http', 'userSrv', 'audioSrv', 'facebookSrv', 'apolloSrv', 'transferSrv', 'gameSrv',
    function ($scope, $state, $http, userSrv, audioSrv, facebookSrv, apolloSrv, transferSrv, gameSrv) {

        $scope.newQuestion = {};
        $scope.question = {};
        $scope.question.questionContent = "";
        $scope.question.answers = ["0", "1", "2", "3"];
        $scope.question.difficultyLevels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
        $scope.question.questionTags = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"];

        var validateQuestionContent = function () {
            if ($scope.question.questionContent == null || $scope.question.questionContent == "") {
                return false;
            }
            return true;
        };

        $scope.questionContentChange = function () {
            if (validateQuestionContent() == false) {
                $('#questionContent').css({
                    "border-color": "red !important"
                });
            } else {
                $('#questionContent').css({
                    "border-color": "green !important"
                });
            }
        };

        var validateQuestionTags = function () {
            var questionTags = [];
            $(':checkbox').each(function () {
                if ($(this).is(":checked")) {
                    questionTags.push($(this).val());
                }
            });
            if (questionTags.length) {
                return true;
            } else {
                return false;
            }
        };


        $scope.postQuestion = function () {
            if (validateQuestionContent() == false) {
                alert("Please, fill in Question Content !");
                return;
            }
            if (validateQuestionTags() == false) {
                alert("Please, fill in Multi Tags !");
                return;
            }

            var str = $scope.question.questionContent;
            var correctAnswer = $('#correctAnswer').val();
            var difficulty_level = $('#difficultyLevel').val();
            var questionTags = [];
            $(':checkbox').each(function () {
                if ($(this).is(":checked")) {
                    questionTags.push($(this).val());
                }
            });

            var questions = [];
            var question = {};

            question.question = JSON.stringify({"text": str.substring(0, str.indexOf("(A)") - 1)});
            question.answer = correctAnswer;
            question.content = JSON.stringify({
                "choices": [
                    {"text": str.substring(str.indexOf("(A)") + 3, str.indexOf("(B)") - 1)},
                    {"text": str.substring(str.indexOf("(B)") + 3, str.indexOf("(C)") - 1)},
                    {"text": str.substring(str.indexOf("(C)") + 3, str.indexOf("(D)") - 1)},
                    {"text": str.substring(str.indexOf("(D)") + 3, str.length)}
                ]
            });
            question.type = "multichoice";
            question.difficulty_level = parseInt(difficulty_level);
            question.links = {
                "tags": questionTags
            }
            questions.push(question);
            var data = {"questions": questions};

            apolloSrv.postQuestion(data, function (data) {
                console.log(data);
            });


        };

    }]);
app.controller('arena.question-audio.ctrl', [ '$scope', '$state', '$http', 'userSrv', 'audioSrv', 'facebookSrv', 'apolloSrv', 'transferSrv', 'gameSrv',
    function ($scope, $state, $http, userSrv, audioSrv, facebookSrv, apolloSrv, transferSrv, gameSrv) {

        $scope.newQuestion = {};
        $scope.question = {};
        $scope.question.questionPictureUrl = "";
        $scope.question.questionAudioUrl = "";
        $scope.question.numberOfAnswers = [3, 4];
        $scope.question.answers = ["0", "1", "2", "3"];
        $scope.question.difficultyLevels = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
        $scope.question.questionTags = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14"];

        var validateQuestionPictureUrl = function () {
            if ($scope.question.questionPictureUrl == null || $scope.question.questionPictureUrl == "") {
                return false;
            }
            return true;
        };

        $scope.questionPictureUrlChange = function () {
            if (validateQuestionPictureUrl() == false) {
                $('#questionPicture').css({
                    "border-color": "red !important"
                });
            } else {
                $('#questionPicture').css({
                    "border-color": "green !important"
                });
            }
        };
        var validateQuestionAudioUrl = function () {
            if ($scope.question.questionAudioUrl == null || $scope.question.questionAudioUrl == "") {
                return false;
            }
            return true;
        };

        $scope.questionAudioUrlChange = function () {
            if (validateQuestionAudioUrl() == false) {
                $('#questionAudio').css({
                    "border-color": "red !important"
                });
            } else {
                $('#questionAudio').css({
                    "border-color": "green !important"
                });
            }
        };

        var validateQuestionTags = function () {
            var questionTags = [];
            $(':checkbox').each(function () {
                if ($(this).is(":checked")) {
                    questionTags.push($(this).val());
                }
            });
            if (questionTags.length) {
                return true;
            } else {
                return false;
            }
        };


        $scope.postQuestion = function () {
//            if(validateQuestionPictureUrl()==false){
//                alert("Please, fill in Question Picture Url !");
//                return;
//            }
            if (validateQuestionAudioUrl() == false) {
                alert("Please, fill in Question Audio Url !");
                return;
            }
            if (validateQuestionTags() == false) {
                alert("Please, fill in Multi Tags !");
                return;
            }

            var pictureUrl = $scope.question.questionPictureUrl;
            var audioUrl = $scope.question.questionAudioUrl;
            var numberOfAnswers = $('#numberOfAnswers').val();
            var correctAnswer = $('#correctAnswer').val();
            var difficulty_level = $('#difficultyLevel').val();
            var questionTags = [];
            $(':checkbox').each(function () {
                if ($(this).is(":checked")) {
                    questionTags.push($(this).val());
                }
            });

            var questions = [];
            var question = {};

            question.question = JSON.stringify({
                "picture_url": pictureUrl,
                "audio_url": audioUrl
            });
            question.answer = correctAnswer;
            if (numberOfAnswers == 4) {
                question.content = JSON.stringify({
                    "choices": [
                        {"text": ""},
                        {"text": ""},
                        {"text": ""},
                        {"text": ""}
                    ]
                });
            } else if (numberOfAnswers == 3) {
                question.content = JSON.stringify({
                    "choices": [
                        {"text": ""},
                        {"text": ""},
                        {"text": ""}
                    ]
                });
            }

            question.type = "multichoice";
            question.difficulty_level = parseInt(difficulty_level);
            question.links = {
                "tags": questionTags
            }
            questions.push(question);
            var data = {"questions": questions};

            console.log(data);
            apolloSrv.postQuestion(data, function (data) {
                console.log(data);
            });


        };

    }]);