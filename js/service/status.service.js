(function(){
	'use strict';

	angular
		.module('slideshow')
		.constant('StatusInterval', 10000)
		.constant('StatusEndpoint', '/api/v1/status')
		.factory('StatusService', StatusService)
	;

	StatusService.$inject = ['$interval', '$http', '$rootScope', 'StatusInterval', 'StatusEndpoint'];
	function StatusService($interval, $http, $rootScope, StatusInterval, StatusEndpoint){
		var cache = {};

		return {
			init: init,
			poll: poll,
			state: state,
		};

		function init(){
			$interval(poll, StatusInterval);
			poll();
		}

		function poll(){
			$http.get(StatusEndpoint).then(function(response){
				var state = response.data.state;

				if ( angular.isUndefined(cache) || cache.value !== state.value ){
					$rootScope.$broadcast('state:change', state);
				}

				if ( response.data.cache ){
					$rootScope.$broadcast('state:cache', response.data.cache);
				}

				cache = state;
			});
		}

		function state(){
			return cache.value;
		}

	}

})();
