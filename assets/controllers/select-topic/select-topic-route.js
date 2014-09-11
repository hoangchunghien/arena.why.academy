/**
 * Created by VanLinh on 8/29/2014.
 */
angular.module('arena.select-topic', [
    'ui.router'
])
    .config([
        '$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('select-topic', {
                    url: '/select-topic',
                    templateUrl: '/views/main/select-topic.html',
                    controller: 'arena.select-topic.ctrl'
                })
        }
    ]);
