(function(){
	'use strict';

	angular
		.module('slideshow')
		.controller('QueueManagerController', QueueManagerController)
	;

	QueueManagerController.$inject = ['QueueAPI'];
	function QueueManagerController(QueueAPI){
		var vm = this;

		vm.name = '';
		vm.saving = false;
		vm.queue = undefined;
		vm.create = create;

		QueueAPI.all().then(function(list){
			vm.queue = list;
		});

		function create(form){
			if ( form.$valid ){
				var name = vm.name;
				vm.saving = true;
				vm.name = '';
				QueueAPI.create(name).then(function(item){
					vm.queue.push(item);
					vm.saving = false;
				}, function(){
					/** @TODO handle errors */
				});
			}
		}

	}

})();
