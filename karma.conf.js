module.exports = function (config) {
    config.set({
        frameworks: ['mocha', 'chai', 'sinon'],
        browsers: ['Chrome'],
        files: [
            'public/build/*.js',
            'public/bower_components/angular-mocks/angular-mocks.js',
            'public/js/test/setup.js',
            'public/js/test/**/*.js',
            'public/templates/**/*.html'
        ],
        preprocessors: {
            'public/templates/**/*.html': ['ng-html2js']
        },
        ngHtml2JsPreprocessor: {
            stripPrefix: 'public',
            moduleName: 'vumigo.templates'
        }
    });
};
