(function(){
	'use strict';

	function mockResponse(value){
		return {
			state: {
				value: value,
				name: 'STOPPED',
			},
		};
	}

	describe('StatusService', function(){
		var StatusService, $httpBackend, $rootScope, $interval, mock, spy;

		beforeEach(module('slideshow'));
		beforeEach(inject(function($injector){
			StatusService = $injector.get('StatusService');
			$httpBackend  = $injector.get('$httpBackend');
			$rootScope    = $injector.get('$rootScope');
			$interval     = $injector.get('$interval');

			spy = spyOn($rootScope, '$broadcast');
			mock = $httpBackend.when("GET", "/api/v1/status");
			mock.respond(mockResponse(1));

			StatusService.init();
		}));

		afterEach(function(){
			$httpBackend.verifyNoOutstandingExpectation();
			$httpBackend.verifyNoOutstandingRequest();
		});

		it('should fetch status on load', function(){
			$httpBackend.expectGET('/api/v1/status');
			$httpBackend.flush();
		});

		describe('should continuously', function(){
			beforeEach(function(){
				/* flush initial fetch */
				$httpBackend.expectGET('/api/v1/status');
				$httpBackend.flush();
			});

			it('poll for state updates', function(){
				$httpBackend.expectGET('/api/v1/status');
				$interval.flush(10000);
				$httpBackend.flush();
			});

			it('return latest state', function(){
				expect(StatusService.state()).toBe(1);
				StatusService.poll();
				mock.respond(mockResponse(2));
				$httpBackend.expectGET('/api/v1/status');
				$httpBackend.flush();
				expect(StatusService.state()).toBe(2);
			});

			it('broadcast when state changes', function(){
				/* validate initial state change event */
				expect($rootScope.$broadcast).toHaveBeenCalledTimes(1);
				expect(spy.calls.mostRecent().args[0]).toBe('state:change');

				/* validate no state change event is broadcasted unless changed */
				StatusService.poll();
				expect($rootScope.$broadcast).toHaveBeenCalledTimes(1);

				/* validate event is broadcasted when changed */
				StatusService.poll();
				mock.respond(mockResponse(2));
				$httpBackend.expectGET('/api/v1/status');
				$httpBackend.flush();
				expect($rootScope.$broadcast).toHaveBeenCalledTimes(2);
				expect(spy.calls.mostRecent().args[0]).toBe('state:change');
			});
		});

	});

})();
