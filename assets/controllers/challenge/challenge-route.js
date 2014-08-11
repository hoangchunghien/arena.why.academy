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
                .state('play', {
                    abstract: true,
                    url: '/play',
                    templateUrl: '/views/challenge/play.html'
                })
                .state('init-game', {
                    parent: 'play',
                    url: '',
                    resolve: {
                        gameFSM: function(gameSrv) {
                            return gameSrv.getGameFSM();
                        }
                    },
                    views: {
                        'play@play': {
                            templateUrl: '/views/challenge/init-game.html',
                            controller: 'arena.play.init-game.ctrl'
                        }
                    }
                })
                .state('on-game', {
                    parent: 'init-game'
                })
                .state('result', {

                })
                .state('finished', {

                })
                .state('challenge', {
                    url: '/challenge',
                    resolve:{
                        delegate:function(){
                            return {};
                        }
                    },
                    templateUrl: '/views/challenge/challenge.html',
                    controller: 'arena.challenge.ctrl',
                    onExit: function(delegate){
                        delegate.destroy();
                    }
                })


        }
    ]);

