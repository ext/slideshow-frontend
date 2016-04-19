(function(){
	'use strict';

	describe('QueueAPI', function(){
		var QueueAPI, $httpBackend;

		beforeEach(module('slideshow'));
		beforeEach(inject(function($injector){
			QueueAPI = $injector.get('QueueAPI');
			$httpBackend  = $injector.get('$httpBackend');

			$httpBackend.when("GET", "/api/v1/queue").respond([]);
			$httpBackend.when("POST", "/api/v1/queue").respond({
				id: 1,
			});
		}));

		afterEach(function(){
			$httpBackend.verifyNoOutstandingExpectation();
			$httpBackend.verifyNoOutstandingRequest();
		});

		describe('all()', function(){

			it('should fetch all queues', function(){
				QueueAPI.all();
				$httpBackend.expectGET('/api/v1/queue');
				$httpBackend.flush();
			});

		});

		describe('create()', function(){

			it('should POST and return new Queue', function(){
				QueueAPI.create('foo').then(function(item){
					expect(item.id).toBeDefined();
				});
				$httpBackend.expectPOST('/api/v1/queue');
				$httpBackend.flush();
			});

		});

	});

})();
