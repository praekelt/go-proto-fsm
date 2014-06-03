module.exports = function (app) {

    // Add the catch-all error handler middleware
    app.use(function (err, req, res, next) {
        console.error(err.stack);
        if (req.xhr) {
            res.json({error: "Oops. An error has occured!"}, 500);
        } else {
            res.status(500);
            res.render('error', {error: err});
        }
    });

};
