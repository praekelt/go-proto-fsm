var http = require('http')
    , path = require('path')
    , express = require('express');

// Create the Express app
var app = express();

// Load the settings
require(path.join(__dirname, 'config', 'settings'))(app);

// Bootstrap the application
require(path.join(__dirname, 'bootstrap'))(app);

// Create an HTTP server and start the app
var port = process.env.PORT || 3000;
var server = http.createServer(app);
server.listen(port, function () {
    console.log("Express server listening on port " + port);
});
