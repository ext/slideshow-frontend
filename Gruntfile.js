/*eslint-env node */
/*eslint strict: [2, "never"]*/
module.exports = function(grunt){
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-sass');

	grunt.registerTask('build', ['sass', 'uglify']);
	grunt.registerTask('default', ['build']);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		eslint: {
			build: [
				'Gruntfile.js',
				'js/**/*.js',
			],
		},

		sass: {
			options: {
				sourceMap: true,
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
					'slideshow/static/js/slideshow.min.js': ['js/**/*.js'],
				},
			},
		},

		watch: {
			js: {
				files: ['<%= eslint.build %>'],
				tasks: ['eslint', 'uglify'],
			},
			scss: {
				files: ['scss/**/*.scss'],
				tasks: ['sass'],
			},
		},
	});
};
