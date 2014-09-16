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
                    parent: 'questions',
                    url: '/new',
                    templateUrl: '/views/questions/question-create.html',
                    controller: 'arena.questions.create.ctrl'
                })

        }
    ]);