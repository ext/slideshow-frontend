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
		vm.connection = '';
		vm.updateConnection = updateConnection;

		init();
		return;

		function init(){
			ConfigurationAPI.get().then(function(data){
				vm.configuration = data;
				vm.loading = false;

				/* delete keys which may not be configured through this model */
				delete vm.configuration.cherrypy;
				delete vm.configuration.Runtime;

				updateConnection();
			});
		}

		function updateConnection(){
			if ( angular.isUndefined(vm.configuration.Database) ){
				vm.connection = '';
				return;
			}

			var db = vm.configuration.Database;
			vm.connection = db.Provider + '://';

			/* build credential-part of the browserstring */
			if ( db.Username ){
				vm.connection += db.Username + '@';
			}

			/* append a / to hostname if specified */
			if ( db.Hostname ){
				vm.connection += db.Hostname + '/';
			}

			vm.connection += db.Name;
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
