/**
 * Created by Hien on 5/30/2014.
 */

var app = angular.module('arena', [
    'arena.main',
    'arena.api.service',
    'arena.utils.service',
    'arena.navigation.controller',
    'ui.router',
    'arena.challenge',
    'arena.challenge.controller',
    'arena.home',
    'arena.home.controller',
	'arena.chat',
	'arena.chat.controller',
    'arena.users.facebook.service',
    'arena.apollo.service',
    'arena.game.service',
    'arena.transfer.service'
]);

app.factory('Seo', function () {
    return {
        title: 'The arena for languages'
    };
})
    .run(
    ['Seo', '$rootScope', '$state', '$stateParams', '$templateCache',
        function (Seo, $rootScope, $state, $stateParams, $templateCache) {
            $rootScope.Seo = Seo;
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;

            // Prevent cache
            $templateCache.removeAll();
        }
    ]
)
    .config([
        '$stateProvider', '$urlRouterProvider', '$locationProvider',
        function ($stateProvider, $urlRouterProvider, $locationProvider) {
            $locationProvider.html5Mode(true);
        }
    ]
);


// Proxy for Analytics, will include MixPanel and Google Analytics
var ApolloAnalytics = {
    track: function(eventString, paramsObject) {
        mixpanel.track(eventString, paramsObject);
    }
}



var isArenaInsideFacebook = function () {
    if (window.name.indexOf("_fb_") > -1) {
        return true;
    }
    return false;
}