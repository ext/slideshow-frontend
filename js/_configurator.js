/* exported configurator */
/* global configurator:true */
/* eslint-disable angular/angularelement */

var configurator = (function($){
	'use strict';

	return {
		init: init,
	};

	function init(){
		/* preview transition during configuration */
		preview_transition();
		$('.conf .transition').change(function(){
			preview_transition();
		});

		$('#sidebar a').disableSelection();
	}

	function preview_transition(){
		var selected = $('.conf .transition :selected').val();
		$('#transition_preview').html('<img src="/transition/' + selected + '.gif" />');
	}

})(jQuery);
