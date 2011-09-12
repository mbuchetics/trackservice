/*global $, document, Handlebars, _ */

// main app
// ========

$(document).ready(function () {
	var host = window.location.hostname,
		songListTempl = Handlebars.compile($('#song_list_template').html());

	function updateRecentSongsList() {	
		$.getJSON('api/last/10', function(data) {
			//console.log(data);
			
			var songListHtml = songListTempl({ 
				songs: data, 
			});
			
			$('#song_list').html(songListHtml);
			$("time.timeago").timeago();
		});	
	}
	
	updateRecentSongsList();

});