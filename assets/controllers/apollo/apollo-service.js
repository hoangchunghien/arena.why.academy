/**
 * Created by VanLinh on 8/7/2014.
 */
angular.module('arena.apollo.service', [
    'arena.users.service'
    , 'arena.api.service'
])
    .service('apolloSrv', ['$http', 'userSrv', 'apiSrv', function ($http, userSrv, apiSrv) {

        var baseUrl = apiSrv.serverPath();
        var self = this;


        this.getPath = function (urlPath, params, callback) {
            var url = baseUrl + urlPath;
            if (params === null) params = {};
            params.app_id = '2';

            ApolloAnalytics.track("GET Start", {"url": urlPath});
            $http({
                method: 'GET',
                url: url,
                params: params,
                headers: {
                    'Access-Token': userSrv.getToken().value
                }
            }).then(function (resp) {
                if (resp) {
                    ApolloAnalytics.track("GET Callback", {"resp": resp});
                }
                ;

                console.log(resp);
                callback(resp.data);
            });
        };


        this.postPath = function (urlPath, params, callback) {

            ApolloAnalytics.track("GET Start", {"url": urlPath});

            var url = baseUrl + urlPath;
            if (params === null) params = {};
            params.app_id = '2';
            $http({
                method: 'POST',
                url: url,
                data: JSON.stringify(params),
                headers: {
                    'Content-Type': 'application/vnd.api+json; charset=utf-8',
                    'Access-Token': userSrv.getToken().value
                }
            }).then(function (resp) {

                if (resp) {
                    ApolloAnalytics.track("GET Callback", {"resp": resp});
                }
                ;
                console.log(resp);
                callback(resp.data);
            });
        };

        this.patchPath = function (urlPath, params, callback) {

            ApolloAnalytics.track("GET Start", {"url": urlPath});

            var url = baseUrl + urlPath;
            if (params === null) params = {};
            params.app_id = '2';
            $http({
                method: 'PATCH',
                url: url,
                data: JSON.stringify(params),
                headers: {
                    'Content-Type': 'application/vnd.api+json; charset=utf-8',
                    'Access-Token': userSrv.getToken().value
                }
            }).then(function (resp) {

                if (resp) {
                    ApolloAnalytics.track("GET Callback", {"resp": resp});
                }
                ;
                console.log(resp);
                callback(resp.data);
            });
        };

        // path-format : quiz/{id} method :get
        this.getQuiz = function (quizID, include, callback) {
            var params = [];
            params.include = include;
            self.getPath("quiz/" + quizID, params, function (data) {
                var quiz = data.quiz;
                for (var i = 0; i < quiz.questions.length; i++) {
                    var question = quiz.questions[i];
                    question.question = JSON.parse(question.question);
                    question.content = JSON.parse(question.content);
                }

                prepareQuizResult(quiz);

                callback(quiz);
            });
        };

        // path-format : quiz/challenge method : post
        this.createNewQuiz = function (friendsID, tags, callback) {
            var params = {};
            params.friends = friendsID;
            if(tags){
                params.tags = tags;
            }
            self.postPath("v2/quiz/challenge", params, function (data) {
                var quiz = data.quiz;
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

        var prepareQuizResult = function (quizData) {

            var userResult = resultForUserID(quizData, quizData.players.user.id);
            if (userResult) {
                quizData.players.user.result = userResult;
            }
            ;

            var opponentResult = resultForUserID(quizData, quizData.players.opponent.id);
            if (opponentResult) {
                quizData.players.opponent.result = opponentResult;
            }
            ;
        };

        var resultForUserID = function (quizData, userID) {
            for (var j = quizData.results.length - 1; j >= 0; j--) {
                var result = quizData.results[j];
                if (result.user_id == userID) {
                    return result;
                }
                ;
            }
            ;
            return null;
        }


        this.getAppActivities = function (userID, read, me, callback) {
            var params = [];
            params.read = read;
            // params.me = me;
            self.getPath("users/" + userID + "/app_activities", null, function (data) {
                var activities = data.app_activities;

                var temporaryFilteredAppActivities = [];
                for (var i = 0; i < activities.length; i++) {
                    var activity = activities[i];
                    var metadata = activity.metadata;

                    if (metadata) {
                        // console.log(activity);
                        activity.metadata = JSON.parse(metadata);
                        activity.is_finished = activity.metadata.is_finished;
                    }

                    if (activity.action == 'challenge') {
                        temporaryFilteredAppActivities.push(activity);
                    }
                    ;


                    // console.log(activity.user.name + ' ' + activity.receiver.name + ' ' + activity.action + ' ' + (activity.is_finished?'is_finished':'not_finished'));


                }

                callback(temporaryFilteredAppActivities);
            });
        };

        this.getFriends = function (userID, callback) {
            self.getPath("users/" + userID + "/friends", null, function (data) {
                var friends = data.user_friends;
                callback(friends);
            });
        }


        this.postQuestion = function (question, callback) {
            self.postPath("v2/questions", question, function (data) {
                var result = data;
                callback(result);
            });
        };

        this.getQuestionTags = function (callback) {
            self.getPath("v2/tags", null, function (data) {
                callback(data.tags);
            });
        };

        this.getAllQuestions = function (callback) {
            var params = {
                "q[type]": "multichoice",
                "sort[]": "-created_at",
                "fields[]": "rates_count"

            };
            self.getPath("v2/questions", params, function (data) {
                callback(data.questions);
            });
        };
        this.rateUp = function (questionId) {
            self.postPath('v2/questions/' + questionId + '/rates/up', null, function () {

            })
        };
        this.rateDown = function (questionId) {
            self.postPath('v2/questions/' + questionId + '/rates/down', null, function () {

            })
        };
        this.getQuestion = function (questionId, callback) {
            var params = {
                "include": "lesson,tags"
            };
            self.getPath("v2/questions" + '/' + questionId, params, function (data) {
                var question = data.questions[0];
                question.question = JSON.parse(question.question);
                question.content = JSON.parse(question.content);
//                question.links = JSON.parse(question.links);
                callback(question);
            });
        };


        this.editQuestion = function (questionId, params, callback) {
            self.patchPath('v2/questions/'+questionId,params,function(data){
                callback(data);
            })
        };


    }]);