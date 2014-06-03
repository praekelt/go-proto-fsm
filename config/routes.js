var path = require('path');

module.exports = function (app) {
    var routes = require(path.join(__dirname, '..', 'routes'))(app);

    app.param(function (name, fn) {
        if (fn instanceof RegExp) {
            return function (req, res, next, val) {
                var captures = fn.exec(String(val));
                if (captures) {
                    req.params[name] = captures;
                    next();
                } else {
                    next('route');
                }
            };
        }
    });

    app.param('id', /^[0-9a-fA-F]{24}$/);

    app.get('*', routes.app);
};
