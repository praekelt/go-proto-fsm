module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        less: {
            css: {
                options: {
                    paths: ['public/css'],
                    cleancss: true
                },
                files: {
                    'public/css/style.css': 'public/css/style.less'
                }
            }
        },
        concat: {
            css: {
                options: {
                    process: function (src, filepath) {
                        if (filepath.indexOf('bootstrap.min.css') != -1) {
                            src = src.replace(/\.\.\/fonts/g, '../bower_components/bootstrap/dist/fonts');
                        }
                        return src;
                    }
                },
                src: [
                    'public/bower_components/bootstrap/dist/css/bootstrap.min.css',
                    'public/css/style.css'
                ],
                dest: 'public/build/styles.css'
            },
            js: {
                src: [
                    'public/bower_components/modernizr/modernizr.js',
                    'public/bower_components/respond/dest/respond.matchmedia.addListener.min.js',
                    'public/bower_components/respond/dest/respond.min.js',
                    'public/bower_components/jquery/dist/jquery.min.js',
                    'public/bower_components/bootstrap/dist/js/bootstrap.min.js',
                    'public/bower_components/d3/d3.min.js',
                    'public/bower_components/angular/angular.min.js',
                    'public/bower_components/angular-route/angular-route.min.js',
                    'public/bower_components/angular-resource/angular-resource.min.js',
                    'public/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
                    'public/bower_components/angular-uuid-service/uuid-svc.min.js',
                    'public/js/src/app.js',
                    'public/js/src/controllers.js',
                    'public/js/src/directives.js',
                    'public/js/src/services/index.js',
                    'public/js/src/services/utils.js',
                    'public/js/src/services/behaviour.js',
                    'public/js/src/services/channel/layout.js',
                    'public/js/src/services/channel/view.js',
                    'public/js/src/services/router/layout.js',
                    'public/js/src/services/router/view.js',
                    'public/js/src/services/conversation/layout.js',
                    'public/js/src/services/conversation/view.js',
                    'public/js/src/services/connection/layout.js',
                    'public/js/src/services/connection/view.js'
                ],
                dest: 'public/build/scripts.js'
            }
        },
        cssmin: {
            css: {
                src: 'public/build/styles.css',
                dest: 'public/build/styles.css'
            }
        },
        uglify: {
            js: {
                files: {
                    'public/build/scripts.js': ['public/build/scripts.js']
                }
            }
        },
        watch: {
            files: ['public/css/**/*.less', 'public/js/**/*.js'],
            tasks: ['less', 'concat']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('default', ['concat:css', 'cssmin:css', 'concat:js',
                                                   'uglify:js']);
};
