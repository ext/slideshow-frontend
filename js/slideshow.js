/* global queues:false, active:false, notice_visible:true */
/* global queue:true, slide:true */

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

			var dialog = $('#delete_dialog');
			dialog.data('slide', id);
			dialog.find('.modal-body img').attr('src', '/slides/show/' + id + '/800/600');
			dialog.modal('show');
		},

		/* delete slide without confirmation */
		real_delete: function(id){
			return $.ajax({
				type: "POST",
				url: "/slides/ajax/delete",
				data: {id: id},
				dataType: 'json',
				success: function(data){
					if ( data.success ){
						$('#slide_' + id).parent().remove();
					} else {
						alert(data.message);
					}
				},
				error: function(x, status, error){
					alert(status + '\n' + error);
				},
			});
		},

		activate: function(id){
			return post("/slides/ajax/activate", {id: id}, function(data){
				$('#slide_' + id + ' > .slide').attr('class', data.class);
			});
		},

		deactivate: function(id){
			return post("/slides/ajax/deactivate", {id: id}, function(data){
				$('#slide_' + id + ' > .slide').attr('class', data.class);
			});
		},
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
	$('#delete_confirm').click(function(){
		var dialog = $(this).parents('.modal');
		var id = dialog.data('slide');
		if ( typeof(id) != 'undefined' ){
			slide.real_delete(id).always(function(){
				$('#delete_dialog').modal('hide');
			});
			dialog.removeData('slide');
		}
	});

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

});
