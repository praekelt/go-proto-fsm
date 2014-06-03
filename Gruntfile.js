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
          'public/js/app.js',
          'public/js/controllers.js',
          'public/js/directives.js',
          'public/js/services.js'
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
      files: ['public/css/*.less', 'public/js/*.js'],
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
