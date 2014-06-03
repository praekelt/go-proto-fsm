var path = require('path')
    , express = require('express')
    , favicon = require('serve-favicon')
    , logger  = require('morgan')
    , bodyParser = require('body-parser')
    , methodOverride = require('method-override')
    , cookieParser = require('cookie-parser');

module.exports = function (app) {
    // Ask Express to serve our favicon
    app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

    // Use a tiny log format in production (https://github.com/expressjs/morgan)
    if ('production' === app.get('env')) {
        app.use(logger('tiny'));
    } else {
        app.use(logger('dev'));
    }

    // Ask the browser to cache static files for a day when
    // running in production
    if ('production' === app.get('env')) {
        app.use(express.static(path.join(__dirname, 'public'), {
            maxAge: 86400000
        }));

    } else {
        app.use(express.static(path.join(__dirname, 'public')));
    }

    // Add the Method Override middleware (https://github.com/expressjs/method-override)
    app.use(methodOverride());

    // Add the Body Parser middleware (https://github.com/expressjs/body-parser)
    app.use(bodyParser());

    // Add the Cookie Parser middleware (https://github.com/expressjs/cookie-parser)
    app.use(cookieParser(app.get('secret')));

    // Configure the app routes
    require(path.join(__dirname, 'config', 'routes'))(app);

    // Configure other middleware
    require(path.join(__dirname, 'config', 'middleware'))(app);
};
