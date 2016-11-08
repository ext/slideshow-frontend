(function(){
	'use strict';

	angular
		.module('slideshow')
		.controller('SlideUploadController', SlideUploadController)
	;

	SlideUploadController.$inject = ['$scope', '$location'];
	function SlideUploadController($scope, $location){
		var vm = this;

		vm.active = $location.path().substr(1);

		$scope.$on('$locationChangeSuccess', function(){
			vm.active = $location.path().substr(1);
		});
	}

})();
