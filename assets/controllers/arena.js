/**
 * Created by Hien on 5/30/2014.
 */

var app = angular.module('arena', [
    'arena.main',
    'arena.api.service',
    'arena.pictures.service',
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
    'arena.transfer.service',
    'arena.questions',
    'arena.questions.controller',
    'arena.select-topic',
    'arena.select-topic.controller'
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



function timeAgo(current, previous) {
    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;


    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
         return Math.round(elapsed/1000) + ' giây trước';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' phút trước';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' giờ trước';   
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed/msPerDay) + ' ngày trước';   
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed/msPerMonth) + ' tháng trước';   
    }

    else {
        return Math.round(elapsed/msPerYear ) + ' năm trước';   
    }
}

function timeAgoWithUTCString(timeString) {
    var time = new Date(timeString);
    var now =  new Date();

    return timeAgo(now.getTime(), time.getTime());
}