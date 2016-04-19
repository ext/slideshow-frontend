(function(){
	'use strict';

	angular
		.module('slideshow')
		.factory('QueueAPI', QueueAPI)
		.constant('QueueEndpoint', '/api/v1/queue')
	;

	QueueAPI.$inject = ['$http', '$q', 'QueueEndpoint'];
	function QueueAPI($http, $q, QueueEndpoint){
		var service = {
			all: all,
			create: create,
		};
		return service;

		function all(){
			return $http.get(QueueEndpoint).then(function(response){
				return response.data;
			});
		}

		function create(name){
			return $http.post(QueueEndpoint, {
				name: name,
			}).then(function(response){
				return response.data;
			});
		}
	}

})();
