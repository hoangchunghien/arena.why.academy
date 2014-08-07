angular.module('arena.main', [
    'ui.router',
    'arena.users.service',
    'arena.users.facebook.service',
    'arena.apollo.service',
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
                .state('home', {
                    url: '/home',
                    templateUrl: '/views/main/home.html',
                    controller: 'arena.home.ctrl'
                })

        }
    ])

    .controller('arena.main.ctrl', function ($scope, Seo, userSrv, facebookSrv) {
        Seo.title = "Arena for English";
        console.log("log facebook");
//        $scope.showButtonPlayGame=userSrv.isAuthenticated();

        var profile = userSrv.getProfile();
        $scope.profile = profile;

        if (profile) {
            mixpanel.identify(profile.id);  
            mixpanel.people.set({
                "$name": profile.name,
                "$email":profile.email
            });
        };

    })

    .controller('arena.home.ctrl', function ($scope, $state, Seo, userSrv, facebookSrv,apolloSrv) {
        Seo.title = "Arena for English";
        console.log("home game");
        $scope.friends=[];
        $scope.profile=userSrv.getProfile();
        apolloSrv.getFriends($scope.profile.id,function(friends){
            console.log(friends);
            $scope.friends=friends;
        });

    })

    .controller('arena.loginFacebook.ctrl', function ($scope, $state, Seo, userSrv, facebookSrv) {
        Seo.title = "Arena for English";
        console.log("log facebook");
        $scope.showButtonPlayGame=true;
//        $state.go('main');
//        facebookSrv.loadFacebookProfile(function(response) {
//            console.log("into load FB");
//            console.log(response);
//            $state.go('main');
//        });
//        $scope.showButtonPlayGame=userSrv.isAuthenticated();
    });