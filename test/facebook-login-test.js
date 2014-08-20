/**
 * Created by hoang_000 on 8/18/2014.
 */

casper.test.begin('User not login facebook yet must occur facebook login dialog', 2, {
    setUp: function(test) {
        casper.start('http://localhost/').then(function () { });
    },

    test: function(test) {
        casper.waitForPopup(/login.php/, function() {
            console.log("facebook dialog popup OK");
            test.assertEquals(this.popups.length, 1);
        });

        casper.withPopup(/login.php/, function() {
            test.assertTitle('Facebook');
        });

        casper.run(function() {
            test.done();
        });
    }
});
