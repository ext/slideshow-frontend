(function(){
	'use strict';

	angular
		.module('slideshow')
		.controller('QueueManagerController', QueueManagerController)
	;

	QueueManagerController.$inject = ['QueueAPI'];
	function QueueManagerController(QueueAPI){
		var vm = this;

		vm.queue = undefined;

		QueueAPI.all().then(function(list){
			vm.queue = list;
		});
	}

})();
