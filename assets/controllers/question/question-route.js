/**
 * Created by VanLinh on 8/18/2014.
 */
angular.module('arena.question', [
    'ui.router'
])
    .config([
        '$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('question', {
                    url: '/question',
                    templateUrl: '/views/main/question.html',
                    controller: 'arena.question.ctrl'
                })
                .state('question-audio', {
                    url: '/question-audio',
                    templateUrl: '/views/main/question-audio.html',
                    controller: 'arena.question-audio.ctrl'
                })

        }
    ]);