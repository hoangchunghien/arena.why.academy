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
app.controller('arena.play.loading-resource.ctrl', ['$scope', '$state', 'audioSrv', 'apolloSrv', 'gameFSM',
    function ($scope, $state, audioSrv, apolloSrv, gameFSM) {
        $scope.gameData = gameFSM.gameData;

        var percentageAuioDownloading = [];
        $scope.percentageDownloading = 0;

//        if (gameFSM.quiz.questions[0].question.audio_url) {
//            for (var i = 0; i < gameFSM.quiz.questions.length; i++) {
//                percentageAuioDownloading[i] = 0;
//            }
//        }
//
//        var checkAudioLoaded = function (audios) {
//            if (audios.length <= 0) {
//                $scope.percentageDownloading = 100;
//                return true;
//            }
//            for (var i = 0; i < audios.length; i++) {
//                if (audios[i].readyState != 4) {
//                    return false;
//                } else {
//                    percentageAuioDownloading[i] = 10;
//                }
//            }
//
//            return true;
//        };
//        var checkImageLoaded = function (images) {
//            if (images.length <= 0) {
//                return true;
//            }
//            for (var i = 0; i < images.length; i++) {
//                if (images[i].complete == false) {
//                    return false;
//                }
//            }
//            return true;
//        };

//        var resources = {"images": [], "audios": []};
//        var checkResourceLoadedTimer;
//        for (var i = 0; i < gameFSM.quiz.questions.length; i++) {
//            if (gameFSM.quiz.questions[i].question.audio_url) {
//                var audioUrl = gameFSM.quiz.questions[i].question.audio_url;
//                audioSrv.addAudio(audioUrl,
//                    function () {
//                        checkResourceLoaded();
//                    },
//                    function (loadedPercent) {
//                        console.log(audioUrl + " [" + loadedPercent * 100 + " %]")
//                    }
//                );
//                resources.audios.push(new Audio(gameFSM.quiz.questions[i].question.audio_url));
//                if (gameFSM.quiz.questions[i].question.picture_url) {
//                    resources.images[i] = new Image();
//                    resources.images[i].src = gameFSM.quiz.questions[i].question.picture_url;
//                }
//            }
//        }

        var findAllResourceUrls = function (quiz) {
            if (!quiz || !quiz.questions) return;
            var resourceUrls = [];
            for (var i in quiz.questions) {
                var question = quiz.questions[i];
                if (question.question.picture_url) {
                    resourceUrls.push({type: 'image', url: question.question.picture_url});
                }

                if (question.question.audio_url) {
                    resourceUrls.push({type: 'audio', url: question.question.audio_url});
                }

                if (question.content.choices) {
                    for (var i in question.content.choices) {
                        var choice = question.content.choices[i];
                        if (choice.picture_url) {
                            resourceUrls.push({type: 'image', url: choice.picture_url});
                        }
                    }
                }
            }
            return resourceUrls;
        };

        var startGame = function () {
            gameFSM.handleEventNotification({name: "loading_resource_finished", data: {}});
        };

        var resourceUrls = findAllResourceUrls(gameFSM.quiz);
        var resourcesLoading = {};
        var checkResourceLoaded = function () {
            var total = 0;
            var size = 0;
            for (var key in resourcesLoading) {
                console.log(key + " [" + resourcesLoading[key] + "]");
                total += resourcesLoading[key];
                console.log("Total: " + total);
                size++;
            }
            var loadedPercent = total / size;
            var loadedPercentRounded = (Math.round(loadedPercent * 10000) / 10000);
            $scope.percentageDownloading = loadedPercentRounded * 100 + "%";
            $scope.$apply();
            if (loadedPercent >= 1) {
                startGame();
            }

        };
        var loadResources = function () {
            if (resourceUrls.length > 0) {
                for (var i in resourceUrls) {
                    var res = resourceUrls[i];
                    resourcesLoading[res.url] = 0;
                    if (res.type == "audio") {
                        audioSrv.addAudio(res.url,
                            function () {
                                console.log("Finished");
                            },
                            function (url, loadedPercent) {
                                console.log(url + " [" + loadedPercent + "]");
                                resourcesLoading[url] = loadedPercent;
                                checkResourceLoaded();
                            },
                            function(url) {
                                resourcesLoading[url] = 1;
                                checkResourceLoaded();
                            }
                        );
                    }
                    else if (res.type == "image") {
                        var img = new Image();
                        img.src = res.url;
                        img.onload = function () {
                            resourcesLoading[this.src] = 1;
                            checkResourceLoaded();
//                            document.createElement("img").src = this.src;
                        }
                    }
                }
            }
            else {
                startGame();
            }
        };

        loadResources();
    }
]);

app.controller('arena.play.on-game.ctrl',
    ['delegate', '$scope', '$state', '$http', '$timeout', 'userSrv', 'audioSrv', 'facebookSrv', 'apolloSrv', 'gameFSM',
        function (delegate, $scope, $state, $http, $timeout, userSrv, audioSrv, facebookSrv, apolloSrv, gameFSM) {
            audioSrv.init();
            var self = this;

            var quizMachine;


            $scope.profile = userSrv.getProfile();

            $scope.gameData = gameFSM.gameData;


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
                        audioSrv.playCountDownAudio();
                        $scope.$apply();
                        if ($scope.ThreeToZero > 0) {
                            _countDownThreeToZero();
                        } else {
                            setTimeout(function () {
                                $scope.ThreeToZero = "Bắt đầu !";
                                audioSrv.playCountDownCoongAudio();
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

            // ---------------------------------------------------------------------------------------------------------
            // FOR LETTERS QUESTION TYPE
            //----------------------------------------------------------------------------------------------------------
            var initForQuestionContent = function () {
                if ($scope.question.content.letters) {
                    $scope.letters = [];
                    for (var i in $scope.question.content.letters)
                        $scope.letters.push($scope.question.content.letters[i]);
                    $scope.choosenLetters = [];
                }
            };

            var generateLettersFromArray = function (letters) {
                var str = "";
                for (var i in letters) {
                    str += letters[i];
                }
                return str;
            };

            $scope.choosenLetters = [];

            $scope.removeChoosenLetter = function (index) {
                if ($scope.choosenLetters[index]) {
                    $scope.question.content.letters.push($scope.choosenLetters[index]);
                    $scope.choosenLetters.splice(index, 1);
                }
            };

            $scope.chooseLetterIndex = function (index) {
                $scope.choosenLetters.push($scope.question.content.letters[index]);
                $scope.question.content.letters.splice(index, 1);
                if ($scope.question.content.letters.length == 0) {
                    var letters = generateLettersFromArray($scope.choosenLetters);
                    var event = {};
                    event.name = "question_answer";
                    event.data = {answer: letters};
                    quizMachine.consumeEvent(event);
                }
            };

            //---------------------------------------------------------------------------------------------------------

            $scope.clickAnswer = function (index, userAnswer) {
                audioSrv.playClickedButton();
                var answer = userAnswer;
                if ($scope.question.type == "MultiPicture" || $scope.question.type == "Picture Multichoice") {
                    answer = index;
                }
                var event = {};
                event.name = "question_answer";
                event.data = {answer: answer};
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

            var findCorrectAnswerIndex = function (correct) {
                for (var i in $scope.question.content.choices) {
                    if ($scope.question.content.choices[i].text == correct) {
                        return i;
                    }
                }
            };

            this.handleEventNotification = function (event) {
                console.log(event);

                switch (event.name) {

                    case "quiz_questioning":
                        if (event.data.question.question.audio_url == null) {
                            audioSrv.playBackgroundAudio();
                        }

//                        audioSrv.createQuestionAudio(event.data.question.question.audio_url);
//                        audioSrv.playQuestionAudio();
                        audioSrv.playAudio(event.data.question.question.audio_url);
                        $scope.question = event.data.question;
                        initForQuestionContent();
                        $scope.timeout += event.data.timeout;
                        console.log("quiz_questioning");
                        console.log($scope.timeout);
                        break;
                    case "question_ending":
//                        audioSrv.destroyQuestionAudio();
                        if (event.data.audio) {
                            audioSrv.stopAudio($scope.question.question.audio_url);
                        }

                        console.log("question_ending");
                        var index = $scope.lastAnswered;
                        var yourAnswer = "Sai";

                        if (event.data.correct) {
                            _activeModal();
                            audioSrv.playCorrectAnswerAudio();
                            if ($scope.question.content.choices) {
                                $scope.answers[index] = {correct: 1};
                            }
                            //$scope.score += event.data.score;
                            gameFSM.myResult.point += event.data.score;

                            $scope.results[$scope.currentQuestion] = {'score': '+' + event.data.score, 'correct': 1};
                            $scope.showCorrect = true;
                            yourAnswer = "Đúng";

                        } else {
                            audioSrv.playWrongAnswerAudio();
                            if ($scope.question.content.choices) {
                                $scope.answers[index] = {correct: 0};
                            }
                            $scope.results[$scope.currentQuestion] = {'score': '+' + event.data.score, 'correct': 0};

                        }
//
                        if ($scope.question.content.choices) {
                            var index = event.data.correctAnswer;
                            if ($scope.question.type != "MultiPicture" && $scope.question.type != "Picture Multichoice") {
                                index = findCorrectAnswerIndex(event.data.correctAnswer);
                            }
                            $scope.answers[index] = {correct: 1};
                            $scope.lastAnswered = null;
                        }

                        $scope.$apply();
                        break;
                    case "question_answered":
                        console.log("Answered");
                        $scope.disabledButton = true;
                        break;
                    case "question_answering":
                        console.log("Answering");
                        break;
                    case "question_time_changed":
                        console.log(event.name, event.data.remainingTime);
                        $scope.countDown = event.data.remainingTime;
                        _updateTimer();
                        $scope.$apply();
                        break;
                    case "question_next_question":
                        console.log("next question");

//                        audioSrv.createQuestionAudio(event.data.question.question.audio_url);
//                        audioSrv.playQuestionAudio();
                        audioSrv.playAudio(event.data.question.question.audio_url);
                        if ($scope.question.question.picture_url) {
                            $scope.question.question.picture_url = null;
                        }

                        $scope.currentQuestion++;
                        $scope.question = event.data.question;
                        initForQuestionContent();
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

            var _updateTimer = function () {
                var percent = ($scope.countDown) / $scope.timeout * 100;
                setTimerClock(parseFloat($scope.countDown / 1000 - 1).toFixed(0), percent);
            }

            var _initialize = function () {

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

//                var resources = {"images": [], "audios": []};
//                var checkResourceLoadedTimer;
//                for (var i = 0; i < gameFSM.quiz.questions.length; i++) {
//                    if (gameFSM.quiz.questions[i].question.audio_url) {
//                        resources.audios.push(new Audio(gameFSM.quiz.questions[i].question.audio_url));
//                        if (gameFSM.quiz.questions[i].question.picture_url) {
//                            resources.images[i]=new Image();
//                            resources.images[i].src = gameFSM.quiz.questions[i].question.picture_url;
//                        }
//                    }
//                }
//
//                var checkResourceLoaded = function () {
//                    checkResourceLoadedTimer = setTimeout(function () {
//                        if (checkAudioLoaded(resources.audios) == true && checkImageLoaded(resources.images) == true) {
//                            clearTimeout(checkResourceLoadedTimer);
//                            quizMachine = new QuizStateMachine(gameFSM.quiz, self);
//                            $scope.numberOfQuestion = quizMachine.quiz.questions.length;
//                            for (var i = 0; i < $scope.numberOfQuestion; i++) {
//                                $scope.results.push({'score': i + 1, 'correct': null});
//                            }
//                            _startModalChallenge();
//                            return;
//                        }
//                        checkResourceLoaded();
//                    }, 1000);
//                };
//                checkResourceLoaded();

                quizMachine = new QuizStateMachine(gameFSM.quiz, self);
                $scope.numberOfQuestion = quizMachine.quiz.questions.length;
                for (var i = 0; i < $scope.numberOfQuestion; i++) {
                    $scope.results.push({'score': i + 1, 'correct': null});
                }
                _startModalChallenge();

            };
            _initialize();


        }]);


app.controller('arena.play.result.ctrl', ['$scope', 'gameSrv', 'gameFSM', 'userSrv', 'audioSrv', 'apolloSrv', 'quizID',
    function ($scope, gameSrv, gameFSM, userSrv, audioSrv, apolloSrv, quizID) {
        audioSrv.init();


        var sound;
        var initialize = function () {
            $scope.profile = userSrv.getProfile();
            $scope.myResult = gameFSM.myResult;
            $scope.quiz = gameFSM.gameData.quiz;


            // $scope.myResult.user = $scope.profile;
            $scope.medalUrl = "";

            $scope.friendResult = {};
            $scope.gameData = gameData = gameFSM.gameData;

            //Question Picture_url
            $scope.questionPictureUrl = null;
            //Question Audio_url
            $scope.questionAudioUrl = null;
            //answers of question for review
            $scope.answersForReview = [];


            $scope.user = null;
            $scope.opponent = null;
            $scope.userWinOrLose = -1;


            $scope.playing = {};
            $scope.playing.question = {};
        };


        var checkUserWinOrLose = function () {
            // Check if data is available
            if ($scope.user == null || $scope.opponent == null) return;
            if ($scope.user.result == null || $scope.opponent.result == null) return;
            if ($scope.user.result.point == null || $scope.opponent.result.point == null) return;


            $scope.userWinOrLose = 0;

            if ($scope.user.result.point == $scope.opponent.result.point) {
                $scope.userWinOrLose = 1;
            }
            else if ($scope.profile.id == $scope.user.id && $scope.user.result.point > $scope.opponent.result.point) {
                $scope.userWinOrLose = 2;
            } else if ($scope.profile.id == $scope.opponent.id && $scope.opponent.result.point > $scope.user.result.point) {
                $scope.userWinOrLose = 2;
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
            }
            ;
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

        };


        $scope.backHome = function () {
            audioSrv.playClickedButton();
            $scope.results = null;
            $scope.medalUrl = null;
            gameSrv.getState().go("home");
//        gameFSM.handleEventNotification({name: "result_finished", data: {}});
            gameFSM = null;
            gameSrv.destroy();

        };

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

        };


        var isUserAnswerCorrect = function (userAnswer) {

            if (!userAnswer) return false;

            var question = questionForUserAnswer(userAnswer);
            if (question.answer == userAnswer.user_answer) {
                return true;
            } else {
                return false;
            }
        };

        $scope.clickRow = function (question, index) {
            audioSrv.playPopupAudio();
            $scope.questionAudioForReview = audioSrv.getAudioForReview();

            $scope.stopAudio();
            $('#my_modal').modal({
                backdrop: 'static',
                keyboard: true
            });
            $('#my_modal').modal('show');
            $('#indexReview').text('Câu hỏi ' + index + ':  ')
            $('#questionReview').text(question.question.text);
            $('#answerReview').text('  ' + question.answer);
            if (question.question.audio_url == null) {
                $scope.answersForReview = question.content.choices;
            }

            if (question.question.picture_url) {
                $scope.questionPictureUrl = question.question.picture_url;
            }
            if (question.question.audio_url) {
                $scope.questionAudioUrl = question.question.audio_url;
            }
            $scope.questionInResult = true;

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
        //replay question audio
//        $scope.playAudio = function () {
////            audioSrv.playAudio($scope.questionAudioUrl);
//
//
//            $scope.playing.question.audioUrl = true;
//            sound = audioSrv.playAudio($scope.questionAudioUrl, function() {
//                $scope.audioStatus = 'stop';
//                $scope.playing.question.audioUrl = false;
//                $scope.$apply();
//            });
//            $scope.audioStatus = 'play';
//        };
//
//        $scope.stopAudio = function() {
//            if(sound){
//                sound.destruct();
//                $scope.playing.question.audioUrl = false;
//            }
//
//        };
//        $scope.togglePauseAudio = function() {
//            if ($scope.audioStatus === 'play') {
//                sound.pause();
//                $scope.audioStatus = 'pause';
//            }
//            else if ($scope.audioStatus === 'pause') {
//                sound.play();
//                $scope.audioStatus = 'play';
//            }
//        };

        $scope.stringForAnsweringTime = function (time) {
            var timeString = (time / 1000).toFixed(1).replace(/\.0$/, '');
            ;
            return timeString + 's';
        };

        $scope.takeSurvey = function () {
            audioSrv.playClickedButton();
            ApolloAnalytics.track("Take Survey", {
                "View": "Result"
            });
        };

        $scope.closeQuestionModal = function () {
            $scope.stopAudio();
            audioSrv.playClickedButton();
            if ($scope.questionPictureUrl) {
                $scope.questionPictureUrl = null;
            }
            $scope.questionIdForRate = null;
        };

        if (gameFSM == null) {
            gameSrv.prepareForShowingResult(quizID, function () {
                gameFSM = gameSrv.getGameFSM();
                initialize();
                _prepareData();
            });
        }
        else {
            initialize();
            _prepareData();
        }

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


var setTimerClock = function (value, temp) {

    if ($('.tempStat')) {

        $('.tempStat').each(function () {

            $(this).html(value);

            if (temp < 20) {

                $(this).animate({
                    borderColor: "#67c2ef"
                }, 'fast');

            } else if (temp > 19 && temp < 40) {

                $(this).animate({
                    borderColor: "#CBE968"
                }, 'slow');

            } else if (temp > 39 && temp < 60) {

                $(this).animate({
                    borderColor: "#eae874"
                }, 'slow');

            } else if (temp > 59 && temp < 80) {

                $(this).animate({
                    borderColor: "#fabb3d"
                }, 'slow');

            } else if (temp > 79 && temp < 100) {

                $(this).animate({
                    borderColor: "#fa603d"
                }, 'slow');

            } else {

                $(this).animate({
                    borderColor: "#ff5454"
                }, 'slow');

            }

        });

    }

}
