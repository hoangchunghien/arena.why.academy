/**
 * Created by VanLinh on 8/7/2014.
 */
angular.module('arena.apollo.service', [

])
    .service('apolloSrv', function ($http) {

        var baseUrl="http://api.why.academy/";
        var self=this;

        this.getPath = function (urlPath, params, callback) {
            var url =baseUrl +urlPath;
            $http.get(url).success(function (data) {
                callback(data);
            });
        };

        this.postPath=function(urlPath,params,callback){

        };

        this.getFriends=function(userID,callback){
            self.getPath("/users/1/friends",null,function(data){
                var friends=data.user_friends;
                callback(friends);
            });

        };

        this.getQuiz=function(quizID,callback){

        };

        this.createNewQuiz=function(userID,friendID,tags,callback){

        };

        this.getAppActivities=function(userID,callback){

        };

        this.postQuizResult=function(userID,quizID,callback){

        };

    });