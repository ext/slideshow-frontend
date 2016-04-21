(function(){
	'use strict';

	angular
		.module('slideshow')
		.factory('ConfigurationAPI', ConfigurationAPI)
		.constant('ConfigurationEndpoint', '/api/v1/configuration')
	;

	ConfigurationAPI.$inject = ['$http', '$q', 'ConfigurationEndpoint'];
	function ConfigurationAPI($http, $q, ConfigurationEndpoint){
		var service = {
			get: get,
			update: update,
		};
		return service;

		function get(){
			return $http.get(ConfigurationEndpoint).then(function(response){
				return response.data;
			});
		}

		function update(data){
			return $http.post(ConfigurationEndpoint, data).then(function(response){
				return response.data;
			});
		}
	}

})();
