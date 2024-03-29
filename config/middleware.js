var app_id = '538356436272071';
var app_secret = 'cadfa5212bf95c5e1001911d0b3adf07';
var fb_callback_url = 'http://local.creator.why.academy/auth/facebook/callback';
//var api_url = "http://api.why.academy";
var api_url = "http://localhost:8080";

var qs = require('querystring');
var request = require('request');
var passport = require('passport')
    , FacebookStrategy = require('passport-facebook').Strategy;

var getUserToken = function (fbToken, callback) {

    var authentication = {'access_token': fbToken};
    console.log("Authentication: " + JSON.stringify(authentication));
    var params = {'authentication': JSON.stringify(authentication)};
    console.log("Param: " + params);
    var url = api_url + '/login/facebook?';
    url += qs.stringify(params);
    console.log("Url :" + url);
    request.post({
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        url: url
    }, function (error, response, body) {
        console.log("Error: " + error);
        console.log("Response: " + JSON.stringify(response));
        console.log("Body: " + body);

        var data = JSON.parse(body);
        var userToken = {
            value: data.access_token,
            expires: data.expires
        };
        var user = {
            token: userToken,
            profile: data.user
        };
        console.log("profile: " + JSON.stringify(data.user));
        callback(user);

    });
};

var verifyHandler = function (token, tokenSecret, profile, done) {
    console.log("verify handler");
    process.nextTick(function () {
        console.log("Getting user why.academy information");
        getUserToken(token, function (user) {
            console.log("Getting user why.academy information [DONE]");
            return done(null, user);

        });
    });
};
passport.serializeUser(function (user, done) {
    // user.user_token = JSON.stringify(user.user_token);
    done(null, user);
});
passport.deserializeUser(function (user, done) {
    //User.findOne({uid: uid}).done(function(err, user) {
    done(null, user);
    //});
});
module.exports = {
    // Init custom express middleware
    express: {
        customMiddleware: function (app) {


            passport.use(new FacebookStrategy({
                    clientID: app_id,
                    clientSecret: app_secret,
                    callbackURL: fb_callback_url
                },
                verifyHandler
            ));
            app.use(passport.initialize());
            //app.use(passport.session());

            var express = require('express');
            var path = require('path');

            // app.use(express.static(path.resolve(__dirname, '..', 'assets')));
            // app.use('/app', express.static(path.resolve(__dirname, '..', '..', 'angular', 'dev', 'src', 'app')));

            app.get('*', function (req, res, next) {
                // console.log("Url: " + req.url);
                var routes = req.url.split('/');
                var i = 0;
                var statics = [
                    'api',
                    'js',
                    'css',
                    'styles',
                    'images',
                    'vendor',
                    'controllers',
                    'views',
                    'commons',
                    'login',
                    'logout',
                    'auth',
                    'data',
                    'qua-tang'
//                    ,'admin'
                ];
                var isStatic = false;
                for (i = 0; i < statics.length; i++) {
                    if (routes[1] === statics[i]) {
                        isStatic = true;
                    }
                }

                /*
                 *  Cache Control set max age for these resources to 1h
                 * */
                if (['controllers', 'commons', 'css', 'views'].indexOf(routes[1]) >= 0) {
                    res.header('Cache-Control', 'private, max-age=3600');
                }

                if (isStatic) {
                    return next();
                }

//                var userAgent = req.headers['user-agent'];
////                console.log(userAgent);
//                if (userAgent)
//                if (userAgent.indexOf('Chrome') >= 0 || userAgent.indexOf('CoRom') >= 0) {
//                    return res.render(path.resolve(__dirname, '..', 'views', 'home', 'index.html'));
//                }
//                else {
//                    return res.render(path.resolve(__dirname, '..', 'views', 'home', 'unsupported.html'));
//                }

                return res.render(path.resolve(__dirname, '..', 'views', 'home', 'index.html'));

            });
        }
    }

};