/*global $, document, Handlebars, _ */

// main app
// ========

$(function() {
	var host = window.location.hostname,
		songListTempl = Handlebars.compile($('#song_list_template').html()),
		songSidebarTempl = Handlebars.compile($('#song_sidebar_template').html()),
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
	
	function refreshSidebar() {
	    $.getJSON('api/songs/top_plays', { 
                count: 10,
                since: getDateAgo(7).toString()
            }, 
            function(songs) {
                var topCount = songs[0].play_count;
                var songList = _(songs).select(function(song) { return song.play_count > 0; }).map(function(song) {
                    return {
                        songId: song._id,
                        artist: song.artist,
                        title: song.title,
                        count: song.play_count,
                        percentage: topCount > 0 ? song.play_count / topCount * 100 : 0
                    }
                });
                
                var songSidebarHtml = songSidebarTempl({ 
        			songs: songList,
        		});

        		$('#top-sidebar').html(songSidebarHtml);
    	    }
    	);
    	
    	$.getJSON('api/songs/top_likes', { 
                count: 10,
                since: getDateAgo(7).toString()
            }, 
            function(songs) {
                var topCount = songs[0].like_count;
                var songList = _(songs).select(function(song) { return song.like_count > 0; }).map(function(song) {
                    return {
                        songId: song._id,
                        artist: song.artist,
                        title: song.title,
                        count: song.like_count,
                        percentage: topCount > 0 ? song.like_count / topCount * 100 : 0
                    }
                });
                
                var songSidebarHtml = songSidebarTempl({ 
        			songs: songList,
        		});

        		$('#popular-sidebar').html(songSidebarHtml);
    	    }
    	);
	}
	
	function getDateAgo(daysAgo) {
	    return Date.today().add({days: -daysAgo});
	}
	
	function setActiveMenuItem(selector) {
	    $('.topbar').find('.active').removeClass('active');
	    $('.topbar').find(selector).addClass('active');
	}
	
	var AppRouter = Backbone.Router.extend({
	    routes: {
	        "/all": "showAll",
	        "/recent": "showRecent",
	        "/top": "showMostPlayedSongs",
	        "/popular": "showMostLikedSongs",
	        "": "showRecent",
	        "/:user": "showRecent"
	    },
	    
	    showAll: function(user) {
	        setActiveMenuItem('.menu-all');
	        $('#page-title').html('All Tracks <small>from the beginning of time</small>');
	        
	        $.getJSON('api/plays', { 
	                count: -1
	            }, 
	            function(plays) {
	                renderPlayList(plays);
        	    }
        	);
	    },
	    
	    showRecent: function(user) {
	        setActiveMenuItem('.menu-recent');
	        $('#page-title').html('Recent Tracks <small>Last 15 plays</small>');
	        
	        $.getJSON('api/plays', { 
	                count: 15
	            }, 
	            function(plays) {
	                renderPlayList(plays);
        	    }
        	);
	    },
	    
	    showMostPlayedSongs: function(user) {
	        setActiveMenuItem('.menu-top');
	        $('#page-title').html('Top Tracks <small>Top 15 of last week</small>');
	        
	        $.getJSON('api/songs/top_plays', { 
	                count: 15,
	                since: getDateAgo(7).toString()
	            }, 
	            function(songs) {
	                var songList = _.map(songs, function(song) {
	                    return {
	                        songId: song._id,
	                        artist: song.artist,
	                        title: song.title,
	                        count: song.play_count
	                    }
	                });
	                renderSongList(songList);
        	    }
        	);
	    },
	    
	    showMostLikedSongs: function(user) {
	        setActiveMenuItem('.menu-popular');
	        $('#page-title').html('Popular Tracks <small>Top 15 of last week</small>');
	        
	        $.getJSON('api/songs/top_likes', { 
	                count: 15,
	                since: getDateAgo(7).toString()
	            }, 
	            function(songs) {
	                var songList = _.map(songs, function(song) {
	                    return {
	                        songId: song._id,
	                        artist: song.artist,
	                        title: song.title,
	                        count: song.like_count,
	                    }
	                });
	                renderSongList(songList);
        	    }
        	);
	    }
	});

	var appRouter = new AppRouter();
	Backbone.history.start();
	
	refreshSidebar();
});