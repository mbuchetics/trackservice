/*global $, document, Handlebars, _ */

// main app
// ========

$(function() {
	var host = window.location.hostname,
		songListTempl = Handlebars.compile($('#song_list_template').html());
	
	function renderSongsList(songs) {
	    var songListHtml = songListTempl({ 
			songs: songs, 
		});
		
		$('#song_list').html(songListHtml);
		$("time.timeago").timeago();
	}
	
	var AppRouter = Backbone.Router.extend({
	    routes: {
	        "/all": "showAll",
	        "/recent": "showRecent",
	        "": "showRecent",
	    },
	    
	    showAll: function() {
	        console.log('showAll');
	        $('#page_title').html('All Songs');
	        $.getJSON('api/all', function(songs) {
	            renderSongsList(songs);
        	});
	    },
	    
	    showRecent: function() {
	        console.log('showRecent');
	        $('#page_title').html('Last 10 Songs');
	        $.getJSON('api/last/10', function(songs) {
	            renderSongsList(songs);
        	});
	    }
	});
	
	var appRouter = new AppRouter();
	Backbone.history.start();
});