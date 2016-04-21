(function(){
	'use strict';

	describe('ConfigurationController', function(){
		var $controller, $scope, $rootScope, $window, ConfigurationAPI, vm;

		beforeEach(module('slideshow'));
		beforeEach(inject(function($injector, $q){
			$controller      = $injector.get('$controller');
			$rootScope       = $injector.get('$rootScope');
			$window          = $injector.get('$window');
			ConfigurationAPI = $injector.get('ConfigurationAPI');

			spyOn(ConfigurationAPI, 'get').and.returnValue($q.when({}));
			spyOn(ConfigurationAPI, 'update').and.callFake(function(data){
				if ( !data.invalid ){
					return $q.when({success: true});
				} else {
					return $q.when({success: false, errors: []});
				}
			});

			$scope = {};
			$window = {location: {href: '/config'}};
			vm = $controller('ConfigurationController', {
				$scope: $scope,
				$window: $window,
				ConfigurationAPI: ConfigurationAPI,
			});
		}));

		it('should fetch configuration on load', function(){
			expect(ConfigurationAPI.get).toHaveBeenCalled();
		});

		it('should save configuration if form is valid', function(){
			var form = {
				$valid: true,
			};
			vm.submit(form);
			expect(ConfigurationAPI.update).toHaveBeenCalled();
		});

		it('should redirect if save was successful', function(){
			var form = {
				$valid: true,
			};
			vm.submit(form);
			$rootScope.$digest();
			expect($window.location.href).toBe('/maintenance');
		});

		it('should not redirect if save was unsuccessful', function(){
			$rootScope.$digest(); /* finish loading before continue test */
			var form = {
				$valid: true,
			};
			vm.configuration.invalid = true;
			vm.submit(form);
			$rootScope.$digest();
			expect($window.location.href).toBe('/config');
		});

		it('should not save configuration if form is invalid', function(){
			var form = {
				$valid: false,
			};
			vm.submit(form);
			expect(ConfigurationAPI.update).not.toHaveBeenCalled();
		});

		describe('should update connection string', function(){

			it('given nothing', function(){
				vm.configuration.Database = undefined;
				vm.updateConnection();
				expect(vm.connection).toBe('');
			});

			it('given provider and name', function(){
				vm.configuration.Database = {
					Provider: 'foo',
					Name: 'bar',
				};
				vm.updateConnection();
				expect(vm.connection).toBe('foo://bar');
			});

			it('given provider, name, username', function(){
				vm.configuration.Database = {
					Provider: 'foo',
					Name: 'bar',
					Username: 'fred',
				};
				vm.updateConnection();
				expect(vm.connection).toBe('foo://fred@bar');
			});

			it('given provider, name, hostname', function(){
				vm.configuration.Database = {
					Provider: 'foo',
					Name: 'bar',
					Hostname: 'barney',
				};
				vm.updateConnection();
				expect(vm.connection).toBe('foo://barney/bar');
			});

			it('given provider, name, hostname, username', function(){
				vm.configuration.Database = {
					Provider: 'foo',
					Name: 'bar',
					Hostname: 'barney',
					Username: 'fred',
				};
				vm.updateConnection();
				expect(vm.connection).toBe('foo://fred@barney/bar');
			});

		});

	});

})();
