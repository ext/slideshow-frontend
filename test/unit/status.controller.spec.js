(function(){
	'use strict';

	describe('StatusController', function(){
		var $controller, $rootScope, $scope, vm;

		beforeEach(module('slideshow'));
		beforeEach(inject(function($injector){
			$controller = $injector.get('$controller');
			$rootScope  = $injector.get('$rootScope');
			$scope = {};
			vm = $controller('StatusController', { $scope: $scope });
		}));

		describe('daemon status', function(){
			it('should initially be set', function(){
				expect(vm.stateName).toBe('');
				expect(vm.stateClass).toBe('daemon-fetching');
			});

			it('should be updated when state change event fires', function(){
				$rootScope.$broadcast('state:change', {name: 'foo', value: 1});
				expect(vm.stateName).toBe('foo');
				expect(vm.stateClass).toBe('daemon-foo');
			});
		});

	});

})();
