(function(){
	'use strict';

	angular
		.module('slideshow')
		.controller('StatusController', StatusController)
	;

	StatusController.$inject = ['$rootScope', 'StatusService'];
	function StatusController($rootScope, StatusService){
		var vm = this;
		vm.stateName = '';
		vm.stateClass = 'daemon-fetching';

		/* eslint-disable angular/on-watch */
		$rootScope.$on('state:change', function(event, state){
			vm.stateName = state.name;
			vm.stateClass = 'daemon-' + state.name;
		});

		StatusService.init();
	}

})();
