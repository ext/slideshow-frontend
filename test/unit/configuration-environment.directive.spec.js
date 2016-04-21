(function(){
	'use strict';

	describe('configurationEnvironment directive', function(){
		var $rootScope, form, element;

		beforeEach(module('slideshow'));
		beforeEach(inject(function($injector, $compile){
			$rootScope  = $injector.get('$rootScope');
			form = $compile('<form name="form"><textarea configuration-environment name="input" ng-model="model"></textarea></form>')($rootScope);
			element = form.find('textarea');
		}));

		it('should parse value', function(){
			element.val('foo=bar\nfred=barney').triggerHandler('input');
			$rootScope.$digest();
			expect($rootScope.model.foo).toBe('bar');
			expect($rootScope.model.fred).toBe('barney');
		});

		it('should format value', function(){
			$rootScope.model = {
				'foo': 'bar',
				'spam': 'ham',
			};
			$rootScope.$digest();
			expect(element.val()).toBe('foo=bar\nspam=ham\n');
		});

	});

})();
