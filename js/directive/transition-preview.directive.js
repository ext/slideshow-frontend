(function(){
	'use strict';

	angular
		.module('slideshow')
		.directive('transitionPreview', transitionPreview)
	;

	function transitionPreview(){
		return {
			scope: {
				src: '=transitionPreview',
			},
			template: '<img ng-if="src" src="/transition/{{src}}.gif" />',
		};
	}

})();
