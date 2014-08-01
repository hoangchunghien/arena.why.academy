/**
 * Created by Hien on 6/2/2014.
 */

angular.module('arena.audio.service', [

])
    .service('audioSrv', function () {
        var backgroundAudio;
        var countDownAudio;
        var countDownCoongAudio;
        var wrongAnswerAudio;
        var correctAnswerAudio;

        this.playAudio = function (url) {
            var mySound = soundManager.createSound({
                url: url
            });
            mySound.play();
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
        this.getBackgroundAudio = function () {
            var url = arguments[0];
            var loop = arguments[1];
            if (backgroundAudio == null) {
                backgroundAudio = soundManager.createSound({
                    id: 'backgroundAudio',
                    url: url,
                    loops: loop
                });
            }
            return backgroundAudio;
        };
        this.setBackgroundAudio = function (sound) {
            backgroundAudio = sound;
        };
        //
        this.getCountDownAudio = function () {
            var url = arguments[0];
            if (countDownAudio == null) {
                countDownAudio = soundManager.createSound({
                    id: 'countDownAudio',
                    url: url
                });
            }
            return countDownAudio;
        };
        this.setCountDownAudio = function (sound) {
            countDownAudio = sound;
        };
        //
        this.getCountDownCoongAudio = function () {
            var url = arguments[0];
            if (countDownCoongAudio == null) {
                countDownCoongAudio = soundManager.createSound({
                    id: 'countDownCoongAudio',
                    url: url
                });
            }
            return countDownCoongAudio;
        };
        this.setCountDownCoongAudio = function (sound) {
            countDownCoongAudio = sound;
        };
        //
        this.getCorrectAnswerAudio = function () {
            var url = arguments[0];
            if (correctAnswerAudio == null) {
                correctAnswerAudio = soundManager.createSound({
                    id: 'correctAnswerAudio',
                    url: url
                });
            }
            return correctAnswerAudio;
        };
        this.setCorrectAnswerAudio = function (sound) {
            correctAnswerAudio = sound;
        };
        //
        this.getWrongAnswerAudio = function () {
            var url = arguments[0];
            if (wrongAnswerAudio == null) {
                wrongAnswerAudio = soundManager.createSound({
                    id: 'wrongAnswerAudio',
                    url: url
                });
            }
            return wrongAnswerAudio;
        };
        this.setWrongAnswerAudio = function (sound) {
            wrongAnswerAudio = sound;
        };

        this.destroyAllSound = function () {
            backgroundAudio.destruct();
            backgroundAudio = null;
            countDownAudio.destruct();
            countDownAudio = null;
            countDownCoongAudio.destruct();
            countDownCoongAudio = null;
            soundManager.destroySound('wrongAnswerAudio');
            soundManager.destroySound('correctAnswerAudio');

        };


    });