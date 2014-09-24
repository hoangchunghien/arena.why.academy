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
        apolloSrv.getQuestionTags(function (questionTags) {
            $scope.questionTags = questionTags;
        });
        //for check the question of you
        $scope.userProfile = userSrv.getProfile();
        $scope.isYourQuestion = false;
        //

        apolloSrv.getAllQuestions(function (questions) {
            for (var i = 0; i < questions.length; i++) {

                questions[i].question = JSON.parse(questions[i].question);
                questions[i].content = JSON.parse(questions[i].content);
            }
            $scope.questions = questions;

        })
        $scope.clickRow = function (index) {
            audioSrv.playPopupAudio();
            $scope.questionAudioForReview = audioSrv.getAudioForReview();
            $scope.tags = $scope.questions[index].links.tags;
            $scope.rates_count = $scope.questions[index].rates_count;
            $scope.my_rate = $scope.questions[index].my_rate;
            $scope.questionId = $scope.questions[index].id;
            $scope.questionIndex = index;
            $scope.stopAudio();
            $('#my_modal').modal({
                backdrop: 'static',
                keyboard: true
            });
            $('#my_modal').modal('show');
            $('#indexReview').text('Câu hỏi');
            $('#questionReview').text($scope.questions[index].question.text);
            $('#answerReview').text('  ' + $scope.questions[index].answer);
            $('#questionAuthor').text($scope.questions[index].user.name);
            if ($scope.questions[index].question.audio_url == null) {
                $scope.answersForReview = $scope.questions[index].content.choices;
                console.log($scope.answersForReview);
            }

            if ($scope.questions[index].question.picture_url) {
                $scope.questionPictureUrl = $scope.questions[index].question.picture_url;
            }
            if ($scope.questions[index].question.audio_url) {
                $scope.questionAudioUrl = $scope.questions[index].question.audio_url;
            }
            if ($scope.userProfile.id == $scope.questions[index].user.id) {
                $scope.isYourQuestion = true;
            }

        };

        $scope.playAudio = function () {
            audioSrv.playAudioForReview($scope.questionAudioUrl);
        };
        $scope.stopAudio = function () {
            audioSrv.stopAudioForReview();
        };
        $scope.togglePauseAudio = function () {
            audioSrv.togglePauseAudioForReview();
        };
        $scope.closeQuestionModal = function () {
            $scope.stopAudio();
            audioSrv.playClickedButton();
            $('#questionReview').text(null);
            $('#questionAuthor').text(null);
            $('#my_modal').modal({
                backdrop: 'static',
                keyboard: true
            });
            $('#my_modal').modal('hide');
            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
            $scope.answersForReview = null;
            if ($scope.questionPictureUrl) {
                $scope.questionPictureUrl = null;
            }
            if ($scope.questionAudioUrl) {
                $scope.questionAudioUrl = null;
            }
            $scope.tags = null;
            $scope.rates_count = null;
            $scope.my_rate = null;
            $scope.questionId = null;
            $scope.isYourQuestion = false;
        };
        $scope.rateUp = function () {
            if ($scope.my_rate == -1) {
                $scope.questions[$scope.questionIndex].rates_count += 2;
            } else {
                $scope.questions[$scope.questionIndex].rates_count += 1;
            }

            $scope.rates_count = $scope.questions[$scope.questionIndex].rates_count;
            $scope.questions[$scope.questionIndex].my_rate = 1;
            $scope.my_rate = $scope.questions[$scope.questionIndex].my_rate;
            apolloSrv.rateUp($scope.questionId);
//            $scope.$apply();
        };
        $scope.rateDown = function () {
            if ($scope.my_rate == 1) {
                $scope.questions[$scope.questionIndex].rates_count -= 2;
            } else {
                $scope.questions[$scope.questionIndex].rates_count -= 1;
            }
            $scope.rates_count = $scope.questions[$scope.questionIndex].rates_count;
            $scope.questions[$scope.questionIndex].my_rate = -1;
            $scope.my_rate = $scope.questions[$scope.questionIndex].my_rate;
            apolloSrv.rateDown($scope.questionId);
//            $scope.$apply();
        };
        $scope.createNewQuestion = function () {
            $state.go('question-create');
        };
        $scope.editQuestion = function () {
            $scope.closeQuestionModal();
            $state.go('question-edit', {questionId: $scope.questions[$scope.questionIndex].id});
        };
        $scope.shareQuestion = function () {
            $scope.closeQuestionModal();
            $state.go('question-share', {questionId: $scope.questions[$scope.questionIndex].id});
        };

        $scope.timeAgo = timeAgoWithUTCString;
    }
]);

app.controller('arena.questions.share.ctrl', [
    '$scope', '$state', '$http', 'userSrv', 'audioSrv', 'picturesSrv', 'apolloSrv', 'questionId',
    function ($scope, $state, $http, userSrv, audioSrv, picturesSrv, apolloSrv, questionId) {

        $scope.playing = {};
        $scope.playing.question = {};
        apolloSrv.getQuestionTags(function (questionTags) {
            $scope.questionTags = questionTags;
        });
        apolloSrv.getQuestion(questionId, function (question) {
            $scope.question = question;
            $scope.my_rate = question.my_rate;

            if (question.question.audio_url) {

                question.question.text = "When you hear a question or statement and three responses. You must select the " +
                    "best response to the question or statement.";
                if (question.question.picture_url) {

                    question.question.text = "When you hear the statements, you must select the one statement that" +
                        " best decribes what you see in the picture.";
                }

            }
        });
        $scope.rateUp = function () {
            if ($scope.my_rate == -1) {
                $scope.question.rates_count += 2;
            } else {
                $scope.question.rates_count += 1;
            }

            $scope.my_rate = 1;;
            apolloSrv.rateUp($scope.question.id);

        };
        $scope.rateDown = function () {
            if ($scope.my_rate == 1) {
                $scope.question.rates_count -= 2;
            } else {
                $scope.question.rates_count -= 1;
            }

            $scope.my_rate = -1;
            apolloSrv.rateDown($scope.question.id);
        };
        var sound;
        $scope.playAudio = function () {
            $scope.playing.question.audioUrl = true;
            sound = audioSrv.playAudio($scope.question.question.audio_url, function () {
                $scope.audioStatus = 'stop';
                $scope.playing.question.audioUrl = false;
                $scope.$apply();
            });
            $scope.audioStatus = 'play';
        };
        $scope.stopAudio = function () {
            sound.destruct();
            $scope.playing.question.audioUrl = false;
        };
        $scope.togglePauseAudio = function () {
            if ($scope.audioStatus === 'play') {
                sound.pause();
                $scope.audioStatus = 'pause';
            }
            else if ($scope.audioStatus === 'pause') {
                sound.play();
                $scope.audioStatus = 'play';
            }
        };
    }
]);


app.controller('arena.questions.create.ctrl', [
    '$scope', '$state', '$http', 'userSrv', 'audioSrv', 'picturesSrv', 'apolloSrv', 'viewData',
    function ($scope, $state, $http, userSrv, audioSrv, picturesSrv, apolloSrv, viewData) {

        if (viewData.mode == 'new') {
            $scope.question = {};
            $scope.question.question = {};
            $scope.question.content = {};
            $scope.question.content.choices = [];
            $scope.question.links = {};
            $scope.question.links.tags = [];
        } else {
            apolloSrv.getQuestion(viewData.questionId, function (question) {
                $scope.question = {};
                $scope.question.question = {};
                $scope.question.content = {};
                $scope.question.content.choices = [];
                $scope.question.links = {};

                $scope.question = question;

                $scope.question.correct = {};
                $scope.question.correct.text = question.answer;

                $scope.originalTags = question.links.tags;
                $scope.question.links.tags = [];


                loadQuestionAnswerSelector();
                initAnswer();
                initTags();
                validateAllContentForEditQuestion();

            });

        }


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

        var validateAllContentForEditQuestion = function () {
            validateQuestionPictureUrl();
            validateQuestionAudioUrl();
            validateAnswerGroup();
            validateQuestionAnswer();
            validateQuestionContent();
            validateQuestionTags();
        };

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
        $scope.playAudio = function () {
            $scope.playing.question.audioUrl = true;
            sound = audioSrv.playAudio($scope.question.question.audio_url, function () {
                $scope.audioStatus = 'stop';
                $scope.playing.question.audioUrl = false;
                $scope.$apply();
            });
            $scope.audioStatus = 'play';
        };
        $scope.stopAudio = function () {
            sound.destruct();
            $scope.playing.question.audioUrl = false;
        };
        $scope.togglePauseAudio = function () {
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
                if (viewData.mode == 'new') {
                    createNewQuestion();
                } else if (viewData.mode == 'edit') {
                    editQuestion();
                }
            }
        };

        var createNewQuestion = function () {
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

        };


        var editQuestion = function () {
//            var content = JSON.stringify($scope.question.content);
//            var question = JSON.stringify($scope.question.question);
            var content = generateContent();
            var question = generateQuestion();
            var answer = generateAnswer();

            var oldTags = $scope.originalTags;
            var newTags = generateTagsLink();

            var params = [];
            params = [
                { "op": "replace", "path": "/questions/0/question", "value": question },
                { "op": "replace", "path": "/questions/0/content", "value": content },
                { "op": "replace", "path": "/questions/0/answer", "value": answer }
            ];
            for (var i = 0; i < oldTags.length; i++) {
                params.push({ "op": "remove", "path": "/questions/0/links/tags/" + oldTags[i] });
            }
            for (var i = 0; i < newTags.length; i++) {
                params.push({ "op": "add", "path": "/questions/0/links/tags/-", "value": newTags[i] });
            }
            apolloSrv.editQuestion(viewData.questionId, params, function (data) {
                alert('Edit successfully !');
            });
        };

        var generateAnswer = function () {
            return $scope.question.correct.text;
        };

        var generateContent = function () {
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

        var generateQuestion = function () {
            var question = {};
            if ($scope.question.question.text) {
                question.text = $scope.question.question.text;
            }
            if ($scope.question.question.picture_url) {
                question.picture_url = $scope.question.question.picture_url;
            }
            if ($scope.question.question.audio_url) {
                question.audio_url = $scope.question.question.audio_url;
            }
            return JSON.stringify(question);
        };

        var generateTagsLink = function () {
            var tags = [];
            for (var i in $scope.question.links.tags) {
                if ($scope.question.links.tags[i]) {
                    tags.push(i + '');
                }
            }
            return tags;
        };

        // TODO load static tag from api server
        $scope.static = {};

        apolloSrv.getQuestionTags(function (questionTags) {
            $scope.static.tags = questionTags;
        });
//        $scope.static.tags = [
//            {
//                id: "1",
//                name: "toeic"
//            },
//            {
//                id: "2",
//                name: "ielts"
//            },
//            {
//                id: "3",
//                name: "toefl"
//            },
//            {
//                id: "4",
//                name: "grammar"
//            },
//            {
//                id: "5",
//                name: "reading"
//            },
//            {
//                id: "6",
//                name: "vocabulary"
//            },
//            {
//                id: "7",
//                name: "listening"
//            },
//            {
//                id: "8",
//                name: "very-easy"
//            },
//            {
//                id: "9",
//                name: "starter"
//            },
//            {
//                id: "10",
//                name: "developing"
//            },
//            {
//                id: "11",
//                name: "target"
//            },
//            {
//                id: "12",
//                name: "analyst"
//            },
//            {
//                id: "13",
//                name: "photographs"
//            },
//            {
//                id: "14",
//                name: "question-response"
//            }
//        ];
        function initAnswer() {
            for (var i in $scope.question.content.choices) {
                if ($scope.question.answer === $scope.question.content.choices[i].text) {
                    $scope.question.correct = $scope.question.content.choices[i];
                }
            }
        }

        var initTags = function () {
            for (var i = 0; i < $scope.originalTags.length; i++) {
                var tag = $scope.originalTags[i];
                $scope.question.links.tags[tag] = true;
            }
        };
        var initialize = function () {
            if (viewData.mode == 'new') {
                $scope.question.content.choices = [
                    {text: ''}
                ];
            }
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
                && !$scope.question.question.text
                && !$scope.question.question.picture_url
                && !$scope.question.question.audio_url) {

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
            if ($scope.question.question.picture_url) {
                $scope.processing.question.pictureUrl = true;
                picturesSrv.checkPictureUrl($scope.question.question.picture_url, function (valid) {
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
            if ($scope.question.question.audio_url) {
                $scope.processing.question.audioUrl = true;
                audioSrv.checkSoundUrl($scope.question.question.audio_url, function (valid) {
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

            console.log($scope.question.correct);

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

            for (var i in $scope.question.links.tags) {
                if ($scope.question.links.tags[i] == true) {
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

