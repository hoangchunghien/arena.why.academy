angular.module('arena.main', [
    'ui.router'
])
    .config([
        '$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('main', {
                    url: '/',
                    templateUrl: '/views/main/main.html',
                    controller: 'arena.main.ctrl'
                })
                .state('login', {
                    url: '/_=_',
                    controller: function($state){
                        $state.go("main");
                    }
                })
        }
    ])

    .controller('arena.main.ctrl', function (Seo) {
        Seo.title = "Arena for English";
    });