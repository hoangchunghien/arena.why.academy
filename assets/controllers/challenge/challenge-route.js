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
                        gameFSM: function (gameSrv) {
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
                .state('loading-resource', {
                    parent: 'init-game',
                    url: '',
                    resolve: {
                        gameFSM: function (gameSrv) {
                            return gameSrv.getGameFSM();
                        }
                    },
                    views: {
                        'play@play': {
                            templateUrl: '/views/challenge/init-game.html',
                            controller: 'arena.play.loading-resource.ctrl'
                        }
                    }
                })
                .state('on-game', {
                    parent: 'loading-resource',
                    url: '',
                    resolve: {
                        gameFSM: function (gameSrv) {
                            return gameSrv.getGameFSM();
                        },
                        delegate: function () {
                            return {};
                        }
                    },
                    views: {
                        'play@play': {
                            templateUrl: '/views/challenge/on-game.html',
                            controller: 'arena.play.on-game.ctrl'
                        }
                    },
                    onExit: function (delegate) {
                        delegate.destroy();
                    }
                })
                .state('result', {
                    // parent: 'on-game',
                    url: 'result',
                    resolve: {
                        gameFSM: function (gameSrv) {
                            return gameSrv.getGameFSM();
                        }
                    },
                    templateUrl: '/views/challenge/result.html',
                    controller: 'arena.play.result.ctrl'
                    // views: {
                    //     'play@play': {
                    //         templateUrl: '/views/challenge/result.html',
                    //         controller: 'arena.play.result.ctrl'
                    //     }
                    // }
                })
                .state('finished', {
                    parent: 'result',
                    url: '',
                    resolve: {
                        gameFSM: function (gameSrv) {
                            return gameSrv.getGameFSM();
                        }
                    },
                    views: {
                        'play@play': {
                            templateUrl: '/views/challenge/finished.html',
                            controller: 'arena.play.finished.ctrl'
                        }
                    }
                })
                .state('challenge', {
                    url: '/challenge',
                    resolve: {
                        delegate: function () {
                            return {};
                        }
                    },
                    templateUrl: '/views/challenge/challenge.html',
                    controller: 'arena.challenge.ctrl',
                    onExit: function (delegate) {
                        delegate.destroy();
                    }
                })


        }
    ]);

