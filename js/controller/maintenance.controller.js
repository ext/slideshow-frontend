(function(){
	'use strict';

	angular
		.module('slideshow')
		.controller('MaintenanceController', MaintenanceController)
	;

	var NO_REBUILD = 0;
	var REBUILD_INPROGRESS = 1;
	var REBUILD_COMPLETE = 2;

	MaintenanceController.$inject = ['$rootScope', '$scope', '$interval', '$http', 'CacheService'];
	function MaintenanceController($rootScope, $scope, $interval, $http, CacheService){
		var vm = this;
		var cleanup = [];

		vm.state = '';
		vm.log = [];
		vm.severityClass = severityClass;
		vm.rebuildCache = rebuildCache;
		vm.rebuildConfirm = rebuildConfirm;
		vm.rebuilding = NO_REBUILD;
		vm.cache = {};

		init();

		function init(){
			var callback;

			updateLog();
			$interval(updateLog, 5000);

			/* listen for state changes */
			callback = $rootScope.$on('state:change', function(event, state){
				vm.state = state.name;
			});
			cleanup.push(callback);

			/* listen for cache rebuild progress */
			callback = $rootScope.$on('cache:progress', function(event, progress){
				vm.cache = progress;

				if ( vm.rebuilding === NO_REBUILD && progress.rebuilding === true ){
					vm.rebuilding = REBUILD_INPROGRESS;
				}

				if ( vm.rebuilding === REBUILD_INPROGRESS && progress.rebuilding === false ){
					vm.rebuilding = REBUILD_COMPLETE;
				}
			});
			cleanup.push(callback);

			/* remove all listeners */
			$scope.$on('$destroy', function(){
				for ( var func in cleanup ){
					func();
				}
			});
		}

		function updateLog(){
			$http.get('/maintenance/ajax/log').then(function(response){
				vm.log = response.data;
			});
		}

		var severity = ['fatal', 'warning', 'info', 'verbose', 'debug'];
		function severityClass(index){
			return severity[index];
		}

		function rebuildCache(){
			vm.rebuilding = REBUILD_INPROGRESS;
			vm.cache = {
				value: 0,
				max: 1,
			};
			CacheService.rebuild();
		}

		function rebuildConfirm(){
			if ( vm.rebuilding === REBUILD_COMPLETE ){
				vm.rebuilding = NO_REBUILD;
			}

			/* hack: jquery is available in browser but not in jasmine, but in jasmine this isn't tested so make it conditional */
			if ( window.jQuery ){ // eslint-disable-line
				angular.element('#rebuild-dialog').modal('show');
			}
		}
	}

})();
