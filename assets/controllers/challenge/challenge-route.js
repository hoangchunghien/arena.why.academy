/**
 * Created by VanLinh on 7/24/2014.
 */
angular.module('arena.challenge', [
    'ui.router'
])
    .config([
        '$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('challenge', {
                    url: '/challenge',
                    templateUrl: '/views/challenge/challenge.html',
                    controller: 'arena.challenge.ctrl'
                })
        }
    ]);

