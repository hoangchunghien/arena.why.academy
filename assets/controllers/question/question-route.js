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

        }
    ]);