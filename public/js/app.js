/*global $, document, Handlebars, _ */

// main app
// ========

$(function() {
	var host = window.location.hostname,
		songListTempl = Handlebars.compile($('#song_list_template').html());
	
	function extendSong(song) {
	    var now = new Date(),
	        time = new Date(song.time),
	        day = time.clone().clearTime(),
	        isToday = day.equals(Date.today()),
	        isYesterday = day.equals(Date.today().add(-1).day()),
	        timeDiff = now.getTime() - time.getTime(),
	        timeDiffInMinutes = timeDiff / 1000 / 60,
	        timeStr;
	    
	    if (timeDiffInMinutes < 15) {
	        timeStr = 'vor ' + Math.round(timeDiffInMinutes) + ' min';
	    }
	    else if (isToday) {
	        timeStr = time.toString('HH:mm');
	    }
	    else if(isYesterday) {
	        timeStr = 'gestern ' + time.toString('HH:mm');
	    }
        else {
            timeStr = time.toString('d. MMM. HH:mm');
        }
	    
        return { 
            time: timeStr,
            artist: song.artist,
            title: song.title,
            source: song.source,
            isNew: timeDiffInMinutes < 15,
        };
    }
	
	function renderSongsList(songs) {
	    var extSongs = _.map(songs, extendSong);
	    
	    var songListHtml = songListTempl({ 
			songs: extSongs,
		});
		
		$('#song-list').html(songListHtml);
	}
	
	function setActiveMenuItem(selector) {
	    $('.topbar').find('.active').removeClass('active');
	    $('.topbar').find(selector).addClass('active');
	}
	
	var AppRouter = Backbone.Router.extend({
	    routes: {
	        "/all": "showAll",
	        "/recent": "showRecent",
	        "": "showRecent",
	    },
	    
	    showAll: function() {
	        setActiveMenuItem('.menu-all');
	        $('#page-title').html('Alles');
	        $.getJSON('api/all', function(songs) {
	            renderSongsList(songs);
        	});
	    },
	    
	    showRecent: function() {
	        setActiveMenuItem('.menu-recent');
	        $('#page-title').html('Die letzten Lieder <small>15 oder so ...</small>');
	        $.getJSON('api/recent', { count: 15 }, function(songs) {
	            renderSongsList(songs);
        	});
	    }
	});
	
	var appRouter = new AppRouter();
	Backbone.history.start();
});