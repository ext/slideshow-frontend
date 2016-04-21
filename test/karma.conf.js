/*eslint-env node */
'use strict';

(function(){
	module.exports = function(config){
		config.set({
			basePath: '../',
			files: [
				'./node_modules/angular/angular.js',
				'./node_modules/angular-mocks/angular-mocks.js',
				'js/slideshow.module.js',
				'js/controller/*.js',
				'js/directive/*.js',
				'js/service/*.js',
				'test/unit/**/*.spec.js',
			],

			autoWatch: true,
			frameworks: ['jasmine'],
			browsers: ['PhantomJS'],
			singleRun: true,

			reporters: ['progress'],
			plugins: [
				'karma-phantomjs-launcher',
				'karma-jasmine',
			],
		});
	};
})();
