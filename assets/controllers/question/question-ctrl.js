/**
 * Created by VanLinh on 8/18/2014.
 */

var app = angular.module('arena.questions.controller', [
    'ui.router',
    'arena.audio.service',
    'arena.pictures.service',
    'arena.users.service',
    'arena.users.facebook.service',
    'arena.apollo.service',
    'arena.transfer.service',
    'arena.game.service'

]);

app.controller('arena.questions.home.ctrl', [
    '$scope', '$state', '$http', 'userSrv', 'audioSrv', 'picturesSrv', 'apolloSrv',
    function ($scope, $state, $http, userSrv, audioSrv, picturesSrv, apolloSrv) {
        audioSrv.init();
        audioSrv.playOpenOnGameAudio();

        apolloSrv.getAllQuestions(function(questions){
            for(var i=0; i<questions.length; i++){

                questions[i].question=JSON.parse(questions[i].question);
                questions[i].content=JSON.parse(questions[i].content);
            }
            $scope.questions=questions;
        })

    }
]);

app.controller('arena.questions.ctrl', [ '$scope', '$state', '$http', 'userSrv', 'audioSrv', 'facebookSrv', 'apolloSrv', 'transferSrv', 'gameSrv',
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

    }
]);

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
app.controller('arena.question.create.ctrl', [
    '$scope', '$state', '$http', 'userSrv', 'audioSrv', 'picturesSrv', 'apolloSrv',
    function ($scope, $state, $http, userSrv, audioSrv, picturesSrv, apolloSrv) {
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
        $scope.processing = {};
        $scope.processing.question = {};
        $scope.processing.answer = {};
        $scope.processing.answer.choices = [];
        $scope.playing = {};
        $scope.playing.question = {};

        $scope.questionTextChanged = function () {
            validateQuestionText();
        };

        $scope.questionPictureUrlChanged = function () {
            validateQuestionPictureUrl();
        };

        $scope.questionAudioUrlChanged = function () {

            validateQuestionAudioUrl();
        };

        var sound;
        $scope.playAudio = function() {
            $scope.playing.question.audioUrl = true;
            sound = audioSrv.playAudio($scope.question.audioUrl, function() {
                $scope.audioStatus = 'stop';
                $scope.playing.question.audioUrl = false;
                $scope.$apply();
            });
            $scope.audioStatus = 'play';
        };
        $scope.stopAudio = function() {
            sound.destruct();
            $scope.playing.question.audioUrl = false;
        };
        $scope.togglePauseAudio = function() {
            if ($scope.audioStatus === 'play') {
                sound.pause();
                $scope.audioStatus = 'pause';
            }
            else if ($scope.audioStatus === 'pause') {
                sound.play();
                $scope.audioStatus = 'play';
            }
        };

        $scope.questionChoicesChanged = function (index) {
            var length = $scope.question.content['choices'].length;
            var choiceText = $scope.question.content['choices'][index].text;
            if (choiceText !== "") {
                var hasEmpty = false;
                for (var i = 0; i < length; i++) {
                    if ($scope.question.content['choices'][i].text === "") {
                        hasEmpty = true;
                        break;
                    }
                }
                if (!hasEmpty) {
                    $scope.question.content['choices'][length] = {'text': ''};
                }
            }
            else {
                for (var i = length - 1; i >= 0; i--) {
                    if (i != index && $scope.question.content['choices'][i].text === "") {
                        $scope.question.content['choices'].splice(i, 1);
                    }
                }
            }
            loadQuestionAnswerSelector();
            validateQuestionContent();
        };

        $scope.questionChoiceRemove = function (index) {
            if ($scope.question.correct.text === $scope.question.content.choices[index].text)
                $scope.question.correct = {};
            $scope.question.content.choices.splice(index, 1);
            loadQuestionAnswerSelector();
            validateQuestionAnswer();
        };

        var loadQuestionAnswerSelector = function () {
            $scope.static.answers = [];
            for (var i in $scope.question.content.choices) {
                if ($scope.question.content.choices[i].text !== "") {
                    $scope.static.answers.push($scope.question.content.choices[i]);
                }
            }
        };

        $scope.questionAnswerChanged = function () {
            validateQuestionAnswer();
        };

        $scope.questionTagsChanged = function (tag) {
            validateQuestionTags();
        };

        $scope.saveChanged = function () {
            validateData();
            if (isScopeValid()) {
                var question = {};
                question.type = "multichoice";
                question.difficulty_level = 5;
                var tags = generateTagsLink();
                question.links = {tags: tags};
                question.content = generateContent();
                question.answer = generateAnswer();
                question.question = generateQuestion();

                var questions = [question];
                var data = {questions: questions};
                apolloSrv.postQuestion(data, function (data) {
                    alert(JSON.stringify(data));
                });
            }
        };

        var generateAnswer = function() {
            return $scope.question.correct.text;
        };

        var generateContent = function() {
            var content = {};
            content.choices = [];
            for (var i in $scope.question.content.choices) {
                if ($scope.question.content.choices[i].text !== "") {
                    var choice = {};
                    choice.text = $scope.question.content.choices[i].text;
                    content.choices.push(choice);
                }
            }
            return JSON.stringify(content);
        };

        var generateQuestion = function() {
            var question = {};
            if ($scope.question.text) {
                question.text = $scope.question.text;
            }
            if ($scope.question.pictureUrl) {
                question.picture_url = $scope.question.pictureUrl;
            }
            if ($scope.question.audioUrl) {
                question.audio_url = $scope.question.audioUrl;
            }
            return JSON.stringify(question);
        };

        var generateTagsLink = function () {
            var tags = [];
            for (var i in $scope.question.tags) {
                if ($scope.question.tags[i]) {
                    tags.push(i + '');
                }
            }
            return tags;
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

        var validateData = function () {
            validateQuestionGroup();
            validateAnswerGroup();
            validateTagGroup();
            switchSaveChangeButton();
        };

        var validateQuestionGroup = function () {
            $scope.error.questionGrp = false;
            $scope.validated.questionGrp = false;
            if ($scope.validated.question.text !== ""
                && $scope.validated.question.pictureUrl !== ""
                && $scope.validated.question.audioUrl !== ""
                && !$scope.question.text
                && !$scope.question.pictureUrl
                && !$scope.question.audioUrl) {

                $scope.error.questionGrp = true;
                return;
            }

            $scope.validated.questionGrp = true;

        };

        var validateAnswerGroup = function () {
            $scope.error.answerGrp = false;
            $scope.validated.answerGrp = false;
            if (!$scope.validated.answer.choicesGrp
                || !$scope.validated.answer.correct) {
                // $scope.error.answerGrp = true;
            }
            else {
                $scope.validated.answerGrp = true;
            }
        };

        var validateTagGroup = function () {
            $scope.validated.tagGrp = false;
            $scope.error.tagGrp = false;
            if ($scope.validated.question.tags) {
                $scope.validated.tagGrp = true;
            }
            else {
                // $scope.error.tagGrp = true;
            }
        };

        var switchSaveChangeButton = function () {
            $scope.enabled.btnSave = false;
            if (isScopeValid()) {
                $scope.enabled.btnSave = true;
            }
        };

        var isScopeValid = function () {
            if ($scope.validated.questionGrp
                && $scope.validated.answerGrp
                && $scope.validated.tagGrp) {
                return true;
            }
            return false;
        };

        var validateQuestionText = function () {
            $scope.validated.question.text = true;
            $scope.error.question.text = false;
            validateData();
        };

        var validateQuestionPictureUrl = function () {
            $scope.validated.question.pictureUrl = false;
            $scope.error.question.pictureUrl = false;
            if ($scope.question.pictureUrl) {
                $scope.processing.question.pictureUrl = true;
                picturesSrv.checkPictureUrl($scope.question.pictureUrl, function (valid) {
                    $scope.error.question.pictureUrl = !valid;
                    $scope.processing.question.pictureUrl = false;
                    $scope.validated.question.pictureUrl = valid;
                    validateData();
                    $scope.$apply();
                });
            }
            else {
                $scope.validated.question.pictureUrl = true;
                $scope.error.question.pictureUrl = false;
                validateData();
            }
        };

        var validateQuestionAudioUrl = function () {
            $scope.enabled.playAudio = false;
            $scope.error.question.audioUrl = false;
            $scope.validated.question.audioUrl = false;
            if ($scope.question.audioUrl) {
                $scope.processing.question.audioUrl = true;
                audioSrv.checkSoundUrl($scope.question.audioUrl, function (valid) {
                    $scope.error.question.audioUrl = !valid;
                    $scope.processing.question.audioUrl = false;
                    $scope.validated.question.audioUrl = valid;
                    $scope.enabled.playAudio = valid;
                    validateData();
                    $scope.$apply();
                });
            }
            else {
                $scope.validated.question.audioUrl = true;
                $scope.error.question.audioUrl = false;
                validateData();
            }
        };

        var validateQuestionContent = function () {
            $scope.validated.answer.choicesGrp = false;
            var count = 0;
            for (var i in $scope.question.content.choices) {
                if ($scope.question.content.choices[i].text !== "") {
                    $scope.validated.answer.choices[i] = true;
                    $scope.error.answer.choices[i] = false;
                    count++;
                }
            }
            if (count >= 2) {
                $scope.validated.answer.choicesGrp = true;
            }
            validateData();
        };

        var validateQuestionAnswer = function () {
            $scope.validated.answer.correct = false;
            $scope.error.answer.correct = false;

            if ($scope.question.correct.text) {
                $scope.validated.answer.correct = true;
                $scope.error.answer.correct = false;
            }
            else {
                $scope.validated.answer.correct = false;
                $scope.error.answer.correct = true;
            }
            validateData();
        };

        var validateQuestionTags = function () {
            $scope.validated.question.tags = false;
            $scope.error.question.tags = false;

            var validated = false;
            for (var i in $scope.question.tags) {
                if ($scope.question.tags[i] == true) {
                    $scope.validated.question.tags = true;
                    validated = true;
                    break;
                }
            }
            if (!validated) {
                $scope.error.question.tags = true;
            }
            validateData();
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

    }
]);

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