/*global $, document, Handlebars, _ */

// main app
// ========

$(function() {
	var host = window.location.hostname,
		songListTempl = Handlebars.compile($('#song_list_template').html()),
		playListTempl = Handlebars.compile($('#play_list_template').html());
	
	function addEvents() {
	    $('.button-plus').click(function(e) {
            e.preventDefault();

            console.log('button clicked');
            console.log($(this).parent().parent().attr('class'));
        });
        
        $('tr').mouseover(function() {
            console.log('mouse over');
            console.log($(this).attr('class'));
        });
	}
	
	function extendPlay(play) {
	    var now = new Date(),
	        time = new Date(play.time),
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
            songId: play.song_id,
            time: timeStr,
            artist: play.artist,
            title: play.title,
            source: play.source,
            isNew: timeDiffInMinutes < 15,
        };
    }
	
	function renderPlayList(plays) {
	    var extPlays = _.map(plays, extendPlay);
	    
	    var playListHtml = playListTempl({ 
			plays: extPlays,
		});
		
		$('#song-list').html(playListHtml);
		
		addEvents();
	}
	
	function renderSongList(songs) {
	    var songListHtml = songListTempl({ 
			songs: songs,
		});
		
		$('#song-list').html(songListHtml);
		
		addEvents();
	}
	
	function setActiveMenuItem(selector) {
	    $('.topbar').find('.active').removeClass('active');
	    $('.topbar').find(selector).addClass('active');
	}
	
	var AppRouter = Backbone.Router.extend({
	    routes: {
	        "/all": "showAll",
	        "/recent": "showRecent",
	        "/most-plays": "showMostPlayedSongs",
	        "/most-likes": "showMostLikedSongs",
	        "": "showRecent",
	        "/:user": "showRecent"
	    },
	    
	    showAll: function(user) {
	        setActiveMenuItem('.menu-all');
	        $('#page-title').html('All Songs <small>from the beginning of time</small>');
	        $.getJSON('api/plays/all', function(plays) {
	            renderPlayList(plays);
        	});
	    },
	    
	    showRecent: function(user) {
	        setActiveMenuItem('.menu-recent');
	        $('#page-title').html('Recent Songs <small>last 15</small>');
	        $.getJSON('api/plays/recent', { count: 15 }, function(plays) {
	            renderPlayList(plays);
        	});
	    },
	    
	    showMostPlayedSongs: function(user) {
	        setActiveMenuItem('.menu-most-plays');
	        $('#page-title').html('Most Played Songs <small>top 15</small>');
	        $.getJSON('api/songs/most_plays', { count: 15 }, function(songs) {
	            renderSongList(songs);
        	});
	    },
	    
	    showMostLikedSongs: function(user) {
	        setActiveMenuItem('.menu-most-likes');
	        $('#page-title').html('Most Liked Songs <small>top 15</small>');
	        $.getJSON('api/songs/most_likes', { count: 15 }, function(songs) {
	            renderSongList(songs);
        	});
	    }
	});

	var appRouter = new AppRouter();
	Backbone.history.start();
});