(function(){
	'use strict';

	describe('ConfigurationAPI', function(){
		var ConfigurationAPI, $httpBackend;

		beforeEach(module('slideshow'));
		beforeEach(inject(function($injector){
			ConfigurationAPI = $injector.get('ConfigurationAPI');
			$httpBackend  = $injector.get('$httpBackend');

			$httpBackend.when("GET", "/api/v1/configuration").respond([]);
			$httpBackend.when("POST", "/api/v1/configuration").respond({
				success: true,
			});
		}));

		afterEach(function(){
			$httpBackend.verifyNoOutstandingExpectation();
			$httpBackend.verifyNoOutstandingRequest();
		});

		describe('get()', function(){

			it('should fetch configuration', function(){
				ConfigurationAPI.get();
				$httpBackend.expectGET('/api/v1/configuration');
				$httpBackend.flush();
			});

		});

		describe('update()', function(){

			it('should POST', function(){
				ConfigurationAPI.update({});
				$httpBackend.expectPOST('/api/v1/configuration');
				$httpBackend.flush();
			});

		});

	});

})();
