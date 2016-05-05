(function(){
	'use strict';

	angular
		.module('slideshow')
		.factory('CacheService', CacheService)
		.constant('CacheEndpoint', '/api/v1/cache')
	;

	CacheService.$inject = ['CacheEndpoint', '$rootScope', '$http'];
	function CacheService(CacheEndpoint, $rootScope, $http){
		var rebuilding = false;
		init();

		return {
			isRebuilding: isRebuilding,
			rebuild: rebuild,
		};

		function init(){
			var unregister = $rootScope.$on('state:cache', function(event, progress){
				rebuilding = progress.value !== progress.max && angular.isUndefined(progress.error);
				if ( !rebuilding ){
					reset();
				}

				$rootScope.$broadcast('cache:progress', {
					rebuilding: rebuilding,
					error: progress.errror,
					value: progress.value,
					max: progress.max,
				});
			});

			$rootScope.$on('$destroy', unregister);
		}

		function isRebuilding(){
			return rebuilding;
		}

		function rebuild(){
			$http.delete(CacheEndpoint);
		}

		function reset(){
			$http.patch(CacheEndpoint);
		}
	}

})();
