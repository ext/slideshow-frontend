(function(){
	'use strict';

	angular
		.module('slideshow')
		.directive('configurationGroup', configurationGroup)
	;

	function configurationGroup(){
		return {
			restrict: 'E',
			scope: {
				name: '@',
			},
			transclude: true,
			templateUrl: '/template/directive/configuration-group.directive.html',
		};
	}

})();
