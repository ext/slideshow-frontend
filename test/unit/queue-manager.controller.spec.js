(function(){
	'use strict';

	describe('QueueManagerController', function(){
		var $controller, $scope, QueueAPI;

		beforeEach(module('slideshow'));
		beforeEach(inject(function($injector, $q){
			$controller = $injector.get('$controller');
			QueueAPI    = $injector.get('QueueAPI');

			spyOn(QueueAPI, 'all').and.returnValue($q.when([]));

			$scope = {};
			$controller('QueueManagerController', {
				$scope: $scope,
				QueueAPI: QueueAPI,
			});
		}));

		it('should fetch all queues on load', function(){
			expect(QueueAPI.all).toHaveBeenCalled();
		});

	});

})();
