(function(){
	'use strict';

	describe('MaintenanceController', function(){
		var $controller, $rootScope, $scope, vm;

		var CacheServiceMock = {

		};

		beforeEach(module('slideshow'));
		beforeEach(inject(function($injector){
			$controller = $injector.get('$controller');
			$rootScope  = $injector.get('$rootScope');
			$scope = {$on: angular.noop};

			CacheServiceMock.rebuild = jasmine.createSpy('rebuild');

			vm = $controller('MaintenanceController', { $scope: $scope, CacheService: CacheServiceMock });
		}));

		it('should update state when event fires', function(){
			$rootScope.$broadcast('state:change', {name: 'foo', value: 1});
			expect(vm.state).toBe('foo');
		});

		describe('rebuild cache', function(){

			it('should call CacheService', function(){
				vm.rebuildCache();
				expect(CacheServiceMock.rebuild).toHaveBeenCalled();
			});

			it('confirmation dialog should reset status', function(){
				/* no rebuild -> noop */
				vm.rebuilding = 0;
				vm.rebuildConfirm();
				expect(vm.rebuilding).toBe(0);

				/* in progress -> noop */
				vm.rebuilding = 1;
				vm.rebuildConfirm();
				expect(vm.rebuilding).toBe(1);

				/* complete -> no rebuild */
				vm.rebuilding = 2;
				vm.rebuildConfirm();
				expect(vm.rebuilding).toBe(0);
			});

			it('should update state when cache progress event fires', function(){
				$rootScope.$broadcast('cache:progress', {
					rebuilding: true,
					error: undefined,
					value: 2,
					max: 7,
				});
				expect(vm.cache.rebuilding).toBe(true);
				expect(vm.cache.error).toBeUndefined();
				expect(vm.cache.value).toBe(2);
				expect(vm.cache.max).toBe(7);
				expect(vm.rebuilding).toBe(1);
			});

		});

	});

})();
