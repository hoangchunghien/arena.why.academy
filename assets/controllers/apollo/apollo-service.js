/**
 * Created by VanLinh on 8/7/2014.
 */
angular.module('arena.apollo.service', [
    'arena.users.service'

])
    .service('apolloSrv', ['$http', 'userSrv', function ($http, userSrv) {

        var baseUrl = "http://staging.why.academy:8080/";
//        var baseUrl = "http://api.why.academy/";
        var self = this;


//        this.getPath = function (urlPath, params, callback) {
//            var url = baseUrl + urlPath;
//            $http.get(url).success(function (data) {
//                callback(data);
//            });
//        };

        this.getPath = function (urlPath, params, callback) {
            var url = baseUrl + urlPath;
            $http({
                method: 'GET',
                url: url,
                params: params,
                headers: {
                    'Access-Token': userSrv.getToken().value
                }
            }).then(function (resp) {
                callback(resp.data);
            });
        };


        this.postPath = function (urlPath, params, callback) {
            var url = baseUrl + urlPath;
            $http({
                method: 'POST',
                url: url,
                data: JSON.stringify(params),
                headers: {
                    'Content-Type': 'application/vnd.api+json; charset=utf-8',
                    'Access-Token': userSrv.getToken().value
                }
            }).then(function (resp) {
                callback(resp.data);
            });
        };

        this.getFriends = function (userID, callback) {
            self.getPath("users/" + userID + "/friends", null, function (data) {
                var friends = data.user_friends;
                callback(friends);
            });

        };

        // path-format : quiz/{id} method :get
        this.getQuiz = function (quizID, include, callback) {
            var params = [];
            params.include = include;
            self.getPath("v2/quiz/" + quizID, params, function (data) {
                var quiz=data.quiz;
                for (var i = 0; i < quiz.questions.length; i++) {
                    var question = quiz.questions[i];
                    question.question = JSON.parse(question.question);
                    question.content = JSON.parse(question.content);
                    console.log(question.question);
                }
                callback(quiz);
            });
        };

        // path-format : quiz/challenge method : post
        this.createNewQuiz = function (friendsID, tags, callback) {
            var params = {};
            params.friends = friendsID;
            params.tags = tags;
            self.postPath("v2/quiz/challenge", params, function (data) {
                var quiz=data.quiz;
                for (var i = 0; i < quiz.questions.length; i++) {
                    var question = quiz.questions[i];
                    question.question = JSON.parse(question.question);
                    question.content = JSON.parse(question.content);
                }
                callback(quiz);
            });
        };

        //path-format: method : post  quiz/id/results
        this.postQuizResults = function (quizID, result, callback) {
            self.postPath("v2/quiz/" + quizID + "/results", result, function (data) {
                var results = data;
                console.log(results);
                callback(results);
            });
        };


        //path-format: method : get  quiz/id/results
        this.getQuizResults = function (userID, callback) {
            self.getPath("v2/quiz/" + userID + "/results", null, function (data) {
                var quiz = data;
                callback(quiz);
            });
        };


        this.getAppActivities = function (userID, read, me, callback) {
            var params = [];
            params.read = read;
            params.me = me;
            self.getPath("users/" + userID + "/app_activities", null, function (data) {
                var activities = data.app_activities;
                callback(activities);
            });
        };


    }]);