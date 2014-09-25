/**
 * Created by VanLinh on 8/18/2014.
 */
angular.module('arena.questions', [
    'ui.router'
])
    .config([
        '$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {
            $stateProvider

                .state('questions', {
                    url: '/questions',
                    templateUrl: '/views/questions/questions.html',
                    controller: 'arena.questions.home.ctrl'
                })
                .state('question-create', {
                    url: '/questions/new',
                    templateUrl: '/views/questions/question-create.html',
                    controller: 'arena.questions.create.ctrl',
                    resolve: {
                        viewData:function(){
                            return {'mode':'new'};
                        }
                    }
                })
                .state('question-edit', {
                    url: '/questions/{questionId:[0-9]*}/edit',
                    templateUrl: '/views/questions/question-create.html',
                    controller: 'arena.questions.create.ctrl',
                    resolve: {
                        viewData:function($stateParams){
                            return {'mode':'edit','questionId':$stateParams.questionId};
                        }
                    }

                })
                .state('question-share', {
                    url: '/questions/{questionId:[0-9]*}',
                    templateUrl: '/views/questions/question-share.html',
                    controller: 'arena.questions.share.ctrl',
                    resolve: {
                        questionId:function($stateParams){
                            return $stateParams.questionId;
                        }
                    }

                })

        }
    ]);