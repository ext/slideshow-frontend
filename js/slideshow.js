/* exported update_browserstring, config_open, text_preview_init */
/* global queues:false, active:false, notice_visible:true */
/* global queue:true, slide:true, config:true */

var queue = (function(){
	'use strict';

	function all_queues_except(id){
		return queues.filter(function(x){ return x !== id; });
	}

	return {
		sorting: function(){
			/* test if queues exists on this page */
			if ( typeof(queues) == 'undefined' ){
				return;
			}

			function updated(){
				var current_id = '#' + $(this).attr('id');
				var list = $(this).sortable('toArray');
				var n = list.length;

				/* show/hide warning about empty queue */
				if ( current_id === active ){
					if ( notice_visible && n > 0 ){
						notice_visible = false;
						$("#empty_notice").fadeOut("slow");
					}
					if ( !notice_visible && n === 0 ){
						notice_visible = true;
						$("#empty_notice").fadeIn("slow");
					}
				}

				/* notify server about update */
				$.ajax({
					type: "POST",
					url: "/slides/ajax/move",
					data: "queue=" + $(this).attr('id') + "&slides=" + list,
					error: function(x, status, error){
						alert(status + '\n' + error);
					},
				});
			}

			/* queues is a global variable */
			for ( var i in queues ){
				var id = queues[i];
				var other = all_queues_except(id);
				$(id).bind('updated', updated);
				$(id).sortable({
					connectWith: other,
					placeholder: {
						element: function(){
							return $('<div class="item"><div class="placeholder"></div></div>')[0];
						},
						update: function(){
							return;
						},
					},
					tolerance: 'pointer',
					distance: 10,
					update: function(){
						$(this).trigger('updated');
					},
				});
				$(id).disableSelection();
			}
		},
	};
})();

var slide = (function(){
	'use strict';

	var post = function(url, data, func){
		$.ajax({
			type: "POST",
			url: url,
			data: data,
			dataType: 'json',
			success: function(data){
				if ( data.success ){
					func(data);
				} else {
					alert(data.message);
				}
			},
			error: function(x, status, error){
				alert(status + '\n' + error);
			},
		});
	};

	return {
		/* show a confirmation dialog and delete if user confirms (exception
		 * being if quick is true in which case it is deleted immediately) */
		delete: function(id, quick){
			if ( quick ){
				slide.real_delete(id);
				return;
			}

			$("#delete_dialog img").attr('src', '/slides/show/' + id + '/800/600');
			$("#delete_dialog").dialog({
				modal: true,
				resizable: false,
				width: 834, /* 800 + 17 + 17 (padding) */
				height: 700,
			});
		},

		/* delete slide without confirmation */
		real_delete: function(id){
			$.ajax({
				type: "POST",
				url: "/slides/ajax/delete",
				data: {id: id},
				dataType: 'json',
				success: function(data){
					if ( data.success ){
						$('#slide_' + id).remove();
					} else {
						alert(data.message);
					}
					$('#delete_dialog').dialog('close');
				},
				error: function(x, status, error){
					alert(status + '\n' + error);
					$('#delete_dialog').dialog('close');
				},
			});
		},

		activate: function(id){
			return post("/slides/ajax/activate", {id: id}, function(data){
				$('#slide_' + id).attr('class', data.class);
			});
		},

		deactivate: function(id){
			return post("/slides/ajax/deactivate", {id: id}, function(data){
				$('#slide_' + id).attr('class', data.class);
			});
		},
	};
})();

var config = (function(){
	'use strict';

	function preview_transition(){
		var selected = $('.conf .transition :selected').val();
		$('#transition_preview').html('<img src="/transition/' + selected + '.gif" />');
	}

	return {
		preview_transition: preview_transition,
	};
})();

$(document).ready(function(){
	'use strict';

	/* enable sorting on main page */
	queue.sorting();

	/* setup delete dialog buttons */
	$('#delete_cancel').bind('click', function(){
		$('#delete_dialog').dialog('close');
	});
	$('#delete_confirm').bind('click', slide.real_delete);

	/* enable hoverintent on slides */
	$('.item .slide').hoverIntent({
		over: function(){
			$(this).addClass('in');
		},
		out: function(){
			$(this).removeClass('in');
		},
		timeout: 200,
	});

	/* fold slide upload fieldsets */
	var $f = $('.foldable');
	$f.foldable({
		collapsed: function(){
			/* all start collapsed but text assembler */
			return $(this).attr('id') !== 'assembler_text';
		},
		expanded_html: '',
		collapsed_html: '',
		connected: $f,
	});

	/* preview transition during configuration */
	config.preview_transition();
	$('.conf .transition').change(function(){
		config.preview_transition();
	});
});

function update_browserstring(){
	'use strict';

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

function config_open(section){
	'use strict';

	/* reset current selection */
	$('#sidebar a').attr('class', '');
	$('.conf fieldset').hide();

	$('#menu_'+section+' a').attr('class', 'selected');
	$('#conf_'+section).show();
}

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
		fields = $('.assembler.have-preview .trigger-preview').find('input, textarea');
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
