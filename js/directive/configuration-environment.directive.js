(function(){
	'use strict';

	angular
		.module('slideshow')
		.directive('configurationEnvironment', ConfigurationEnvironmentDirective)
	;

	function ConfigurationEnvironmentDirective(){
		return {
			require: 'ngModel',
			link: link,
		};

		function link(scope, elem, attrs, ngModel){
			ngModel.$formatters.push(format);
			ngModel.$parsers.push(parse);
		}

		/* view -> model */
		function parse(string){
			var obj = {};
			var lines = string.split('\n');
			angular.forEach(lines, function(line){
				var match = line.match(/(.*)=(.*)/);
				if ( match ){
					var key   = match[1];
					var value = match[2];
					obj[key] = value;
				}
			});
			return obj;
		}

		/* model -> view */
		function format(obj){
			if ( angular.isDefined(obj) ){
				var string = '';
				angular.forEach(obj, function(value, key){
					string += key + '=' + value + '\n';
				});
				return string;
			} else {
				return undefined;
			}
		}

	}

})();
