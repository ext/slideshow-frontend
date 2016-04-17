/*eslint-env node */
/*eslint strict: [2, "never"]*/
module.exports = function(grunt){
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-eslint');

	grunt.registerTask('default', ['eslint']);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		eslint: {
			build: [
				'Gruntfile.js',
				'slideshow/static/js/slideshow.js',
			],
		},

		watch: {
			js: {
				files: ['<%= eslint.build %>'],
				tasks: ['eslint'],
			},
		},
	});
};
