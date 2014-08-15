angular.module('arena.main', [
    'ui.router',
    'arena.users.service',
    'arena.users.facebook.service',
    'arena.apollo.service'
])
    .config([
        '$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {
            $stateProvider
//                .state('login', {
//                    url: '/',
//                    templateUrl: '/views/main/login.html',
//                    controller: 'arena.loginFacebook.ctrl'
//                })
                .state('main', {
                    url: '/',
                    templateUrl: '/views/main/main.html',
                    controller: 'arena.main.ctrl'
                })
                .state('redirect', {
                    url: '/_=_',
                    controller: function ($state) {
                        $state.go("main");
                    }
                })


        }
    ])

    .controller('arena.main.ctrl', function ($scope, Seo, userSrv) {
        Seo.title = "Arena for English";
        
        var profile = userSrv.getProfile();
        $scope.profile = profile;
        
        if (profile) {
            console.log("Logged In: ", profile.name);

            mixpanel.identify(profile.id);  
            mixpanel.people.set({
                "$name": profile.name,
                "$email":profile.email
            });
        };

        $scope.isArenaInsideFacebook = isArenaInsideFacebook();

    });


