(function(){
	'use strict';

	describe('QueueManagerController', function(){
		var $controller, $scope, QueueAPI, vm;

		beforeEach(module('slideshow'));
		beforeEach(inject(function($injector, $q){
			$controller = $injector.get('$controller');
			QueueAPI    = $injector.get('QueueAPI');

			spyOn(QueueAPI, 'all').and.returnValue($q.when([]));
			spyOn(QueueAPI, 'create').and.returnValue($q.when({id: 1}));

			$scope = {};
			vm = $controller('QueueManagerController', {
				$scope: $scope,
				QueueAPI: QueueAPI,
			});
		}));

		it('should fetch all queues on load', function(){
			expect(QueueAPI.all).toHaveBeenCalled();
		});

		it('should create new queue if form is valid', function(){
			var form = {
				$valid: true,
			};
			vm.create(form);
			expect(QueueAPI.create).toHaveBeenCalled();
		});

		it('should not create new queue if form is invalid', function(){
			var form = {
				$valid: false,
			};
			vm.create(form);
			expect(QueueAPI.create).not.toHaveBeenCalled();
		});

	});

})();
