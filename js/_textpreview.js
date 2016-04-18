/* eslint-disable angular/angularelement, angular/timeout-service */

/* text preview (see text assembler) */
(function($){
	'use strict';

	var delay = 800; /* ms */
	var fields = [];
	var timer;

	return $(init);

	function getParams(){
		var data = {};
		fields.each(function(){
			data[$(this).attr('name')] = $(this).val();
		});
		return $.param(data);
	}

	function update(){
		var url = '/slides/preview?' + getParams();
		$('img.preview-target').attr('src', url);
	}

	function init(){
		fields = $('.fields.have-preview .trigger-preview').find('input, textarea');
		fields
			.blur(update)
			.keydown(function(){
				clearTimeout(timer);
				timer = setTimeout(update, delay);
			})
		;

		/* initial preview */
		update();
	}

})(jQuery);
