/*global module:false*/
module.exports = function(grunt){
	"use strict";

	var pkgConfig = grunt.file.readJSON('package.json');
	pkgConfig.version = grunt.file.readJSON('version.json').version;
	// Project configuration.
	grunt.initConfig({
		pkg     : pkgConfig,
		uglify  : {
			options : {
				banner : '/*! <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> ' + 'Copyright (c) <%= grunt.template.today("yyyy") %> ' + '<%= pkg.author %>; Licensed <%= pkg.licenses[0].type %> */'
			},
			build   : {
				src  : 'dist/<%= pkg.name %>.js',
				dest : 'dist/<%= pkg.name %>.min.js'
			}
		},
		watch   : {
			files : '<config:lint.files>',
			tasks : 'lint test'
		},
		jshint  : {
			all     : ['Gruntfile.js', 'src/**/*.js', 'specs/**/*.js'],
			options : {
				jshintrc : '.jshintrc'
			}
		},
		concat  : {
			source : {
				src  : ['src/**/*.js'],
				dest : 'dist/<%= pkg.name %>.js'
			}
		},
		jasmine : {
			source  : ['src/**/*.js'],
			dist    : ['bin/*.min.js'],
			options : {
				specs : ['specs/**/*.js']
			}
		},
		jsdoc   : {
			dist : {
				src     : ['src/*.js'],
				options : {
					destination : 'docs',
					private     : false
				}
			}
		},
		version : {
			defaults : {
				src : [
					'package.json', 'bower.json', 'src/<%= pkg.name %>.js'
				]
			}
		},
		clean:{
			dist: ['dist']
		}
	});

	grunt.loadNpmTasks('grunt-jsdoc');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-version');
	grunt.loadNpmTasks('grunt-contrib-clean');

	// Default task.
	grunt.registerTask('test', ['jasmine:source']);
	grunt.registerTask('build', ['version', 'test', 'clean:dist', 'concat', 'uglify']);
	grunt.registerTask('docs', ['jsdoc']);
	grunt.registerTask('travis', ['jshint', 'jasmine']);
};