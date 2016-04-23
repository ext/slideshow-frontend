(function(){
	'use strict';

	describe('MaintenanceController', function(){
		var $controller, $rootScope, $scope, vm;

		beforeEach(module('slideshow'));
		beforeEach(inject(function($injector){
			$controller = $injector.get('$controller');
			$rootScope  = $injector.get('$rootScope');
			$scope = {$on: angular.noop};
			vm = $controller('MaintenanceController', { $scope: $scope });
		}));

		it('should update state when event fires', function(){
			$rootScope.$broadcast('state:change', {name: 'foo', value: 1});
			expect(vm.state).toBe('foo');
		});

	});

})();
