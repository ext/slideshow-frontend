(function(){
	'use strict';

	angular
		.module('slideshow')
		.controller('ConfigurationController', ConfigurationController)
	;

	ConfigurationController.$inject = ['$window', 'ConfigurationAPI'];
	function ConfigurationController($window, ConfigurationAPI){
		var vm = this;

		vm.submit = submit;
		vm.configuration = {};
		vm.loading = true;

		init();
		return;

		function init(){
			ConfigurationAPI.get().then(function(data){
				vm.configuration = data;
				vm.loading = false;

				/* delete keys which may not be configured through this model */
				delete vm.configuration.cherrypy;
				delete vm.configuration.Runtime;
			});
		}

		function submit(form){
			if ( form.$valid ){
				ConfigurationAPI.update(vm.configuration).then(function(response){
					if ( response.success ){
						$window.location.href = '/maintenance';
					} else {
						angular.forEach(response.errors, function(error){
							var field = error[0];
							var message = error[1];
							console.log(field, message);
						});
					}
				});
			}
		}
	}

})();
