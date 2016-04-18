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

		update_browserstring();
		$(".browserblur").change(function(){
			update_browserstring();
		});

		$('#sidebar a').disableSelection();
	}

	function preview_transition(){
		var selected = $('.conf .transition :selected').val();
		$('#transition_preview').html('<img src="/transition/' + selected + '.gif" />');
	}

	function update_browserstring(){
		var provider = $("input[name='Database.Provider']").val();
		var username = $("input[name='Database.Username']").val();
		var hostname = $("input[name='Database.Hostname']").val();
		var name     = $("input[name='Database.Name']").val();

		/* build credential-part of the browserstring */
		var credential = '';
		if ( username !== '' ){
			credential = username + '@';
		}

		/* append a / to hostname if specified */
		if ( hostname !== "" ){
			hostname += "/";
		}

		$('.browserstring').html(provider + "://" + credential + hostname + name);
	}

})(jQuery);
