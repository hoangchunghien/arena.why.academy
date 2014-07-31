/// <reference path="Scripts/angular.js" />
/// <reference path="http://code.jquery.com/jquery.min.js" />
/// <reference path="https://cdn.socket.io/socket.io-1.0.6.js" />

var app = angular.module('arena.chat.controller', [
    'ui.router',
    'arena.users.service'
]);
app.controller('arena.chat.ctrl', function ($scope, socket, userSrv) {


    $scope.user = {};
    $scope.rooms = [{room_id:"1", name: "general" }, {room_id:"2", name: "english" },
				{ room_id:"3",name: "other" }];
    //$scope.messages = [{ name: "abc", message: "dsds" }];
    $scope.users = [];
    $scope.username = '';
    
    $scope.joinServer = function(){
        $scope.user.name = this.username;
		$scope.user.id = "999";
		var profile =userSrv.getProfile();
		if (profile)
			$scope.user = profile;
        socket.emit('log in', JSON.stringify($scope.user));
        $scope.joinRoom({room_id:"1", name: "general" });
    }
    $scope.joinRoom = function (room) {
        if (room !== $scope.currentRoom) {
            $scope.currentRoom = room;
            $scope.messages = [];
            socket.emit('join', JSON.stringify({ "user_id": $scope.user.id, "room": room }));
        }
    }
    $scope.sendMessage = function () {
        socket.emit('send', JSON.stringify({ user: $scope.user, "room": $scope.currentRoom,
			message: this.message }));
        $scope.message ='';
    }
    $scope.privateChat = function (user) {
        socket.emit('private chat', user.id);
    }
    socket.on("join", function (data) {
        $scope.users = data;
    });
    socket.on("message", function (string) {
		var data = JSON.parse(string);
		if ($scope.currentRoom.room_id === data.room.room_id)
			$scope.messages.push({ "name": data.user.name, "message": data.message });
    });
    socket.on('private chat offer', function (string) {
		var data = JSON.parse(string);
		$scope.joinRoom(data.room);
        //$scope.currentRoom = data.room;
        //socket.emit('add user', { username: $scope.username, room: data.room });
    });
	socket.on("part", function (data) {
        $scope.users = data;
    });
})
