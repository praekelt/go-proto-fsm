var path = require('path');

module.exports = function (app) {
    app.set('title', "GoProtoFSM");
    app.set('views', path.join(__dirname, '..', 'views'));
    app.set('view engine', 'jade');
    app.set('secret', 'Ji\xb0\xa4\xa3\xb8\xd7q\xe9b\xc7a*\xd9\xb7,\xec@G\x03\x12\x8b\xd6\xa0');

    if ('production' === app.get('env')) {
        app.set('trust proxy', true);
    }
};
