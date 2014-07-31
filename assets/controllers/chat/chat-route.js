/**
 * Created by VanLinh on 7/24/2014.
 */
angular.module('arena.chat', [
    'ui.router'
])
    .config([
        '$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('chat', {
                    url: '/chat',
                    templateUrl: '/views/chat/chat.html',
                    controller: 'arena.chat.ctrl'
                })
        }
    ]);

