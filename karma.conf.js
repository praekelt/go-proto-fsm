module.exports = function (config) {
    config.set({
        frameworks: ['mocha', 'chai', 'sinon'],
        browsers: ['Chrome'],
        files: [
            'public/build/*.js',
            'public/bower_components/angular-mocks/angular-mocks.js',
            'public/bower_components/jquery.simulate/libs/jquery.simulate.js',
            'public/js/test/**/*.js',
            'public/templates/**/*.html'
        ]
    });
};
