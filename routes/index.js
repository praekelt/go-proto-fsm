
module.exports = function (app) {

    function app(req, res) {
        res.render('app', {
            title: "Campaign Maker"
        });
    }

    return {
        app: app
    };
};
