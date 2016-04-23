(function(){
	'use strict';

	angular
		.module('slideshow')
		.controller('MaintenanceController', MaintenanceController)
	;

	MaintenanceController.$inject = ['$rootScope', '$scope', '$interval', '$http'];
	function MaintenanceController($rootScope, $scope, $interval, $http){
		var vm = this;

		vm.state = '';
		vm.log = [];
		vm.severityClass = severityClass;

		updateLog();
		$interval(updateLog, 5000);

		var deregister = $rootScope.$on('state:change', function(event, state){
			vm.state = state.name;
		});

		$scope.$on('$destroy', deregister);

		function updateLog(){
			$http.get('/maintenance/ajax/log').then(function(response){
				vm.log = response.data;
			});
		}

		var severity = ['fatal', 'warning', 'info', 'verbose', 'debug'];
		function severityClass(index){
			return severity[index];
		}
	}

})();
