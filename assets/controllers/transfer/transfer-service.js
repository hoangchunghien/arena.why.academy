/**
 * Created by VanLinh on 8/11/2014.
 */
angular.module('arena.transfer.service', [
    'arena.users.service'

])
    .service('transferSrv', [ function () {
        var friendIDs=[];
        var tags=["1"];

        this.getOpponentIDs=function(){
            return friendIDs;
        };

        this.setOpponentIDs=function(value){
            friendIDs = value;
        };

        this.getTags=function(){
            return tags;
        };

        this.setTags=function(value){
            tags = value;
        };
    }]);