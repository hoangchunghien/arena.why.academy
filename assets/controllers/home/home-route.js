/**
 * Created by VanLinh on 7/24/2014.
 */

angular.module('arena.home', [
    'ui.router'
])
    .config([
        '$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('home', {
                    url: '/home',
                    templateUrl: '/views/main/home.html',
                    controller: 'arena.home.ctrl'
                })
                .state('help', {
                    url: '/help',
                    templateUrl: '/views/main/help.html',
                    controller: 'arena.help.ctrl'
                })
        }
    ]);
