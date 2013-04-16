/*global module:false*/
module.exports = function (grunt) {
    "use strict";

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> ' + 'Copyright (c) <%= grunt.template.today("yyyy") %> ' + '<%= pkg.author %>; Licensed <%= pkg.licenses[0].type %> */'
            },
            build: {
                src: 'src/<%= pkg.name %>.js',
                dest: 'bin/<%= pkg.name %>-<%= pkg.version %>.min.js'
            }
        },
        watch: {
            files: '<config:lint.files>',
            tasks: 'lint test'
        },
        jshint: {
            all: ['Gruntfile.js', 'src/**/*.js', 'specs/**/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        concat: {
            source: {
                src: ['src/**/*.js'],
                dest: 'bin/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },
        replace: {
            dist: {
                options: {
                    variables: {
                        'version': '<%= pkg.version %>'
                    }
                },
                src: ['bin/**/*<%= pkg.version %>*.js']
            }
        },
        jasmine: {
            source: ['src/**/*.js'],
            dist: [ 'bin/*<%= pkg.version %>.min.js' ],
            options: {
                specs: ['specs/**/*.js']
            }
        },
        jsdoc: {
            dist: {
                src: ['src/*.js'],
                options: {
                    destination: 'docs',
                    private: false
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-replace');

    // Default task.
    grunt.registerTask('test', ['jshint', 'jasmine:source']);
    grunt.registerTask('consolidate', ['concat', 'uglify', 'replace']);
    grunt.registerTask('build', ['test', 'consolidate']);
    grunt.registerTask('docs', ['jsdoc']);
    grunt.registerTask('travis', ['jshint', 'jasmine']);
};