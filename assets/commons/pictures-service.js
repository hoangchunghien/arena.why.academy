/**
 * Created by Hien on 5/31/2014.
 */

angular.module('arena.pictures.service', [
    'arena.api.service'
])
    .config(function($httpProvider) {
        //Enable cross domain calls
        $httpProvider.defaults.useXDomain = true;

        //Remove the header used to identify ajax call  that would prevent CORS from working
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    })

    .service('picturesSrv', ['apiSrv', function(api) {

        var picturesBase64 = {};
        var API_SERVER_URL = api.serverPath();
        this.upload = function(file, name, onProgressCallback, onSuccessCallback) {
            var fd = new FormData();
            fd.append('file', file);
            fd.append('name', name);
            console.log("upload name: " + name);
            var xhr = new XMLHttpRequest();
            xhr.open('POST', API_SERVER_URL + '/photos', true);
            xhr.upload.onprogress = function(e) {
                onProgressCallback(e);
            };
            xhr.onload = function() {
                if (this.status == 200) {
                    var resp = JSON.parse(this.response);
                    onSuccessCallback(resp);
                }
            };
            xhr.send(fd);
        };

        this.checkPictureUrl = function(url) {
            var callback = arguments[1];

            var img = new Image();
            var timer;
            img.onload = function() {
                clearTimeout(timer);
                if (callback) callback(true);
            };
            img.onerror = function() {
                clearTimeout(timer);
                if (callback) callback(false);
            };
            img.src = url;
            timer = setTimeout(function() {
                img.src = url;
                timer;
            }, 3000);
        };

        function convertImgToBase64(url, callback, outputFormat){
            var canvas = document.createElement('CANVAS'),
                ctx = canvas.getContext('2d'),
                img = new Image;
            img.crossOrigin="anonymous";

            img.onload = function(){
                var dataURL;
                canvas.height = img.height;
                canvas.width = img.width;
                ctx.drawImage(img, 0, 0);
                dataURL = canvas.toDataURL(outputFormat);
                callback(this.url, dataURL);
                canvas = null;
            };
            img.src = url;
        };

        this.addPicture = function(url) {
            var callback = arguments[1];
            if (picturesBase64[url]) {
                return picturesBase64[url];
            }
            convertImgToBase64(url, function(_url, base64Img){
                picturesBase64[_url] = base64Img;
                callback(_url, base64Img);
            }, "image/png");
        };


    }]);