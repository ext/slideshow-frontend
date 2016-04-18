/*eslint-env node */
/*eslint strict: [2, "never"]*/
module.exports = function(grunt){
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-sass');

	grunt.registerTask('build', ['copy', 'sass', 'test', 'uglify']);
	grunt.registerTask('test', ['eslint', 'karma']);
	grunt.registerTask('default', ['build']);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		copy: {
			bootstrap: {
				files: [{
					expand: true,
					filter: 'isFile',
					cwd: 'node_modules/bootstrap-sass/assets/fonts/bootstrap',
					src: '*',
					dest: 'slideshow/static/fonts',
				}],
			},
			fontawesome: {
				files: [{
					expand: true,
					filter: 'isFile',
					cwd: 'node_modules/font-awesome/fonts',
					src: '*',
					dest: 'slideshow/static/fonts',
				}],
			},
		},

		eslint: {
			build: [
				'Gruntfile.js',
				'js/**/*.js',
				'test/**/*.js',
			],
		},

		sass: {
			options: {
				sourceMap: true,
				includePaths: [
					'node_modules/bootstrap-sass/assets/stylesheets/',
					'node_modules/font-awesome/scss/',
				],
			},
			build: {
				files: {
					'slideshow/static/css/slideshow.min.css': 'scss/slideshow.scss',
				},
			},
		},

		uglify: {
			options: {
				sourceMap: true,
				spawn: false,
			},
			build: {
				files: {
					'slideshow/static/js/slideshow.min.js': [
						'js/slideshow.js',
						'js/slideshow.module.js',
						'js/**/*.js',
					],
				},
			},
			libs: {
				files: {
					'slideshow/static/js/libs.min.js': [
						'node_modules/jquery/dist/jquery.js',
						'node_modules/angular/angular.js',
						'node_modules/bootstrap-sass/assets/javascripts/bootstrap.js',
						'node_modules/jquery-hoverintent/jquery.hoverIntent.js',
					],
				},
			},
		},

		karma: {
			unit: {
				configFile: 'test/karma.conf.js',
			},
		},

		watch: {
			js: {
				files: ['<%= eslint.build %>'],
				tasks: ['test', 'uglify:build'],
			},
			scss: {
				files: ['scss/**/*.scss'],
				tasks: ['sass'],
			},
		},
	});
};
