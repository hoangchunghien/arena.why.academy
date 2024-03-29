/**
 * Created by Hien on 6/2/2014.
 */

angular.module('arena.audio.service', [

])
    .service('audioSrv', function () {
        var self=this;
        var audioMapping = {};
        var audios = [];
        var backgroundAudio = null;
        var countDownAudio = null;
        var countDownCoongAudio = null;
        var wrongAnswerAudio = null;
        var correctAnswerAudio = null;
        var clickedButton = null;
        var openOnGameAudio = null;
        var popupAudio = null;

        var questionAudio=null;
        var questionAudioForReview={
            "audio":null,
            "playing":null,
            "audioStatus":null
        };

        this.createQuestionAudio=function(audio_url){
//            if (questionAudio == null) {
//                questionAudio = soundManager.createSound({
//                    url: audio_url
//                });
//            }
            questionAudio = soundManager.createSound({
                url: audio_url
            });
        };

        this.destroyQuestionAudio=function(){
            if(questionAudio!=null){
                questionAudio.destruct();
                questionAudio = null;
            }
        };

        this.init = function () {
            if (backgroundAudio == null) {
                backgroundAudio = soundManager.createSound({
                    url: "/data/sound/starting.mp3",
                    loops: 10
                });
            }
            if (countDownAudio == null) {
                countDownAudio = soundManager.createSound({
                    url: "/data/sound/countdown.mp3"
                });
            }
            if (countDownCoongAudio == null) {
                countDownCoongAudio = soundManager.createSound({
                    url: "/data/sound/coong.mp3"
                });
            }
            if (wrongAnswerAudio == null) {
                wrongAnswerAudio = soundManager.createSound({
                    url: "/data/sound/wrong-answer.mp3"
                });
            }
            if (correctAnswerAudio == null) {
                correctAnswerAudio = soundManager.createSound({
                    url: "/data/sound/true-answer.mp3"
                });
            }
            if (clickedButton == null) {
                clickedButton = soundManager.createSound({
                    url: "/data/sound/clicked-button.mp3"
                });
            }
            if (openOnGameAudio == null) {
                openOnGameAudio = soundManager.createSound({
                    url: "/data/sound/open-on-game.mp3"
                });
            }
            if (popupAudio == null) {
                popupAudio = soundManager.createSound({
                    url: "/data/sound/popup.mp3"
                });
            }

        };

        this.addAudio = function(url) {
            var finishedCallback = arguments[1];
            var loadingCallback = arguments[2];
            var onloadCallback = arguments[3];
            var mySound = soundManager.createSound({
                url: url,
                onfinish: function() {
                    if (finishedCallback) {
                        finishedCallback();
                    }
                },
                whileloading: function() {
                    if (loadingCallback) {
                        loadingCallback(this.url, this.bytesLoaded/this.bytesTotal);
                    }
                },
                onload: function() {
                    if (onloadCallback) {
                        onloadCallback(this.url);
                    }
                }
            });
            audios.push(mySound);
            audioMapping[url] = audios.length - 1;
            mySound.play();
            mySound.pause();
        };

        this.stopAudio = function(url) {
            if (audioMapping[url]) {
                audios[audioMapping[url]].stop();
            }
        };

        this.playAudio = function (url) {
            var callback = arguments[1];
            if (audioMapping[url]) {
                audios[audioMapping[url]].play();
                return audios[audioMapping[url]];
            }
            else {
                self.addAudio(url);
                self.playAudio(url);
            }
//            var mySound = soundManager.createSound({
//                url: url,
//                onfinish: function() {
//                    if (callback) {
//                        callback();
//                    }
//                }
//            });
//            mySound.play();
//            return mySound;
        };

        this.checkSoundUrl = function (url) {
            var callback = arguments[1];
            var audio = new Audio();
            var timer;
            audio.oncanplay = function () {
                clearTimeout(timer);
                if (callback) callback(true);
            };
            audio.onerror = function () {
                clearTimeout(timer);
                if (callback) callback(false);
            };
            audio.src = url;
            timer = setTimeout(function () {
                audio.src = url;
                timer;
            }, 3000);
        };
        //

        this.muteAllsound = function () {
            backgroundAudio.mute();
            countDownAudio.mute();
            countDownCoongAudio.mute();
            wrongAnswerAudio.mute();
            correctAnswerAudio.mute();
            clickedButton.mute();
            openOnGameAudio.mute();
            popupAudio.mute();
        }

        this.pauseAllsound = function () {
            backgroundAudio.pause();
            countDownAudio.pause();
            countDownCoongAudio.pause();
            wrongAnswerAudio.pause();
            correctAnswerAudio.pause();
            clickedButton.pause();
            openOnGameAudio.pause();
            popupAudio.pause();

        }

        this.destroyAllSound = function () {
            backgroundAudio.destruct();
            backgroundAudio = null;
            countDownAudio.destruct();
            countDownAudio = null;
            countDownCoongAudio.destruct();
            countDownCoongAudio = null;
            wrongAnswerAudio.destruct();
            wrongAnswerAudio = null;
            correctAnswerAudio.destruct();
            correctAnswerAudio = null;
            clickedButton.destruct();
            clickedButton = null;
            openOnGameAudio.destruct();
            openOnGameAudio = null;
            popupAudio.destruct();
            popupAudio = null;

        };
        this.playBackgroundAudio = function () {
            backgroundAudio.play();
        };
        this.playCountDownAudio = function () {
            countDownAudio.play();
        };
        this.playCountDownCoongAudio = function () {
            countDownCoongAudio.play();
        };
        this.playWrongAnswerAudio = function () {
            wrongAnswerAudio.play();
        };
        this.playCorrectAnswerAudio = function () {
            correctAnswerAudio.play();
        };
        this.playClickedButton = function () {
            clickedButton.play();
        };
        this.playOpenOnGameAudio = function () {
            openOnGameAudio.play();
        };
        this.playPopupAudio = function () {
            popupAudio.play();
        };
        this.playQuestionAudio=function(){
            questionAudio.play();
        };

        this.playAudioForReview = function (audioUrl) {
            questionAudioForReview.playing=true;
            questionAudioForReview.audio = self.playAudio(audioUrl, function() {
                questionAudioForReview.audioStatus = 'stop';
                questionAudioForReview.playing= false;
            });
            questionAudioForReview.audioStatus = 'play';
        };

        this.stopAudioForReview = function() {
            if(questionAudioForReview.audio){
                questionAudioForReview.audio.destruct();
                questionAudioForReview.playing = false;
            }

        };
        this.togglePauseAudioForReview = function() {
            if (questionAudioForReview.audioStatus === 'play') {
                questionAudioForReview.audio.pause();
                questionAudioForReview.audioStatus = 'pause';
            }
            else if (questionAudioForReview.audioStatus === 'pause') {
                questionAudioForReview.audio.play();
                questionAudioForReview.audioStatus = 'play';
            }
        };
        this.getAudioForReview=function(){
            return questionAudioForReview;
        }

    });