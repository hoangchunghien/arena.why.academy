/**
 * Created by hoang_000 on 8/15/2014.
 */
var HomeController = {

    index: function(req, res) {
        var userAgent = req.headers['user-agent'];
        console.log(userAgent);

//        return res.view({
//
//        });
    }
};

module.exports = HomeController;