﻿/// <reference path="Scripts/angular.js" />
/// <reference path="http://code.jquery.com/jquery.min.js" />
/// <reference path="https://cdn.socket.io/socket.io-1.0.6.js" />

var app = angular.module('arena.chat.controller', [
    'ui.router',
    'arena.users.service'
]);
app.controller('arena.chat.ctrl', function ($scope, socket, userSrv) {


    $scope.user = {};
    $scope.rooms = [{id:"1", name: "#general" }];//, {room_id:"2", name: "#english" },
				//{ room_id:"3",name: "#other" }];
    //$scope.messages = [{ name: "abc", message: "dsds" }];
    $scope.users = [];
	$scope.usersInCurrentRoom = [];
    $scope.username = '';
    
    //$scope.joinServer = function(){
		//if (!$scope.user){
			//$scope.user.name = this.username;
			//$scope.user.id = Math.floor((Math.random()*1000)+1);
			//$scope.user.picture_url = "http://www.theipadguide.com/images/facebook50x50.jpg";
			//var profile =userSrv.getProfile();
			//if (profile)
				//$scope.user = profile;
			//socket.emit('log in', JSON.stringify($scope.user));
			//$scope.joinRoom({room_id:"1", name: "#general" });
		//}
    //}
    $scope.joinRoom = function (room) {
        if (room !== $scope.currentRoom) {
            $scope.currentRoom = room;
			$scope.usersInCurrentRoom = [];
            $scope.messages = [];
            socket.emit('join', JSON.stringify({ "user": $scope.user, "room": room }));
        }
    }
    $scope.sendMessage = function () {
        socket.emit('send', encodeURIComponent(JSON.stringify({ user: $scope.user, "room": $scope.currentRoom,
			message: this.message })));
        $scope.message ='';
    }
    $scope.privateChat = function (user) {
		$scope.usersInCurrentRoom = [];
        socket.emit('private chat', user.id);
    }
	$scope.writeMessage = function(event){
		console.log(event);
		if (event.which === 13) {
			$scope.sendMessage();
			//socket.emit('stop typing');
			//typing = false;
		}
	}
	
	
	socket.on("connect", function () {
		console.log("connect");
		if (!$scope.user.name)
		{
			console.log("first time");
			var profile =userSrv.getProfile();
			if (profile)
			{
				$scope.user = profile;
				socket.emit('log in', JSON.stringify($scope.user));
				//$scope.joinRoom({room_id:"1", name: "#general" });
			}
		}
    });
	socket.on("reconnect", function () {
		console.log("reconnect");
	});
	socket.on("reconnect_attempt", function () {
		console.log("reconnect_attempt");
	});
	socket.on("reconnecting", function () {
		console.log("reconnecting");
	});
	socket.on("reconnect_failed", function () {
		console.log("reconnect_failed");
	});
	socket.on("reconnect_error", function () {
		console.log("reconnect_error");
	});
	socket.on("disconnect", function () {
		console.log("disconnect");
	});
    socket.on("log in", function (string) {
		var data = JSON.parse(decodeURIComponent(string));
		//console.log(data);
        $scope.users = data;
		//$scope.joinRoom({room_id:"1", name: "#general" });
		$scope.joinRoom({id:"1"});
    });
	socket.on("new user login", function (string) {
		var data = JSON.parse(decodeURIComponent(string));
		//console.log(data);
        //$scope.users.push(data);
		$scope.users = data;
    });
	socket.on("join", function (string) {
		console.log(string);
		var data = JSON.parse(string);
		console.log(data);
		console.log(data.user);
		console.log(data.user.picture_url);
		var array = $scope.usersInCurrentRoom;
		var i;
		if (array.length !=0)
		{
			for(i = array.length; i--;){
				if (array[i].id === data.user.id) 
					break;
			}
			if (i==-1)
				array.push(data.user);
		}
		else
		{
			array.push(data.user);
		}
    });
    socket.on("message", function (s) {
		console.log("on message");
		var string = decodeURIComponent(s);
		console.log(string);
		//socket.emit('test', string);
		var data = JSON.parse(string);
		if ($scope.currentRoom.id === data.room.id)
		{
			//$scope.messages.push({ "name": data.user.name, "message": data.message.message,
			//"time":data.message.time });
			console.log(data);
			$scope.messages.push(data);
		}
    });
	socket.on('private chat', function (room, string) {
		console.log('private chat');
		console.log(room);
		console.log(string);
		$scope.currentRoom = {id:room};
		var data = JSON.parse(decodeURIComponent(string));
		$scope.messages = data["messages"];
	});
    socket.on('private chat offer', function (string) {
		var data = JSON.parse(string);
		$scope.joinRoom(data.room);
        //$scope.currentRoom = data.room;
        //socket.emit('add user', { username: $scope.username, room: data.room });
    });
	socket.on("user disconnect", function (string) {
		var data = JSON.parse(decodeURIComponent(string));
        //$scope.users = data;
		//for(var i = $scope.users.length; i--;){
		//	if ($scope.users[i].id === data.id) 
		//		$scope.users.splice(i, 1);
		//}
		var array = $scope.usersInCurrentRoom;
		for(var i = array.length; i--;){
			if (array[i].id === data.id) 
				array.splice(i, 1);
		}
    });
})
