(function(){
	'use strict';

	angular
		.module('slideshow')
		.controller('MaintenanceController', MaintenanceController)
	;

	MaintenanceController.$inject = ['$rootScope', '$scope'];
	function MaintenanceController($rootScope, $scope){
		var vm = this;

		vm.state = '';

		var deregister = $rootScope.$on('state:change', function(event, state){
			vm.state = state.name;
		});

		$scope.$on('$destroy', deregister);
	}

})();
