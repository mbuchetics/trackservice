/*global $, document, Handlebars, _ */

// main app
// ========

$(function() {
	var host = window.location.hostname,
	    user = 'TestUser4';

	function getDateAgo(daysAgo) {
	    return Date.today().add({days: -daysAgo});
	}
	
	function likeSong(songId, user) {
	    $.post('api/likes/' + songId, { user: user }, function(data) {
	       console.log('song like ok'); 
	    });
	}
	
	/// Models
	
	var Song = Backbone.Model.extend({
	    like: function() {
	        likeSong(this.get('songId'), user);
	    }
    },
    { // class properties
        create: function(json, maxPlayCount, maxLikeCount) {
            var song = new Song();
            
	        song.set({
	           songId: json._id,
	           artist: json.artist,
	           title: json.title,
	           play_count: json.play_count,
	           like_count: json.like_count,
	           play_percentage: maxPlayCount > 0 ? json.play_count / maxPlayCount * 95 : 0,
	           like_percentage: maxLikeCount > 0 ? json.like_count / maxLikeCount * 95 : 0,
	        });
	        
	        return song;
	    }
	});
    
    var SongList = Backbone.Collection.extend({
        model: Song,
        fetchTopFromServer: function(count) {
            var collection = this;
            $.getJSON('api/songs/top_plays', { 
                count: count,
                since: getDateAgo(7).toString()
            }, 
            function(items) {
                collection.reset(_.map(items, function(item) {
                    return Song.create(item, items[0].play_count, items[0].like_count);
                }));
            });
        },
        fetchPopularFromServer: function(count) {
            var collection = this;
            $.getJSON('api/songs/top_likes', { 
                count: count,
                since: getDateAgo(7).toString()
            }, 
            function(items) {
                collection.reset(_(items).select(function(item) { return item.like_count > 0; })
                    .map(function(item) {
                        return Song.create(item, items[0].like_count, items[0].like_count);
                    }
                ));
            });
        }
    });
    
    var Play = Backbone.Model.extend({
	    like: function() {
            likeSong(this.get('songId'), user);
	    }
    }, // class properties
    {
        create: function(json) {      
            var play = new Play(),
                now = new Date(),
                time = new Date(json.time),
    	        day = time.clone().clearTime(),
    	        today = now.clone().clearTime(),
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

            play.set({ 
                songId: json.song_id,
                time: timeStr,
                artist: json.artist,
                title: json.title,
                source: json.source,
                isNew: timeDiffInMinutes < 15,
            });
            
            return play;
        }
    });
    
    var PlayList = Backbone.Collection.extend({
       model: Play,
       fetchFromServer: function(count) {
           var collection = this;
           $.getJSON('api/plays', { count: count }, 
               function(items) {
	               collection.reset(_.map(items, Play.create));
       	   });
       },
    });
    
    /// Views
    
    var SongView = Backbone.View.extend({
        tagName:  "tr",
        className: "",
        template: Handlebars.compile($('#song_template').html()),
        events: {
            "click .button-plus": "like"
            // mouseover
        }, 
        initialize: function() {
            this.model.bind('change', this.render, this);
        },
        render: function() {
            var json = this.model.toJSON();
            
            if (this.viewType == 'like_count') {
                json.count = json.like_count;
                json.percentage = json.like_percentage;
            }
            else {
                json.count = json.play_count;
                json.percentage = json.play_percentage;
            }
            
            $(this.el).html(this.template(json));
            return this;
        },
        like: function(e) {
            e.preventDefault();
            this.model.like();
        }
    });
    
    var SongListView = Backbone.View.extend({
        tagName: "table",
        className: "zebra-striped",
        initialize: function() {
            this.model.bind('change', this.render, this);        
            this.model.bind('add', this.render, this);
            this.model.bind('remove', this.render, this);
            this.model.bind('reset', this.render, this);
        },
        render: function() {
            var viewType = this.viewType,
                table = this.el;
                
            $(table).empty();
            
            this.model.each(function(song) {
               var view = new SongView({model: song });
               view.viewType = viewType;
               $(table).append(view.render().el);
            });

            return this;
        },
    });
    
    var PlayView = Backbone.View.extend({
        tagName:  "tr",
        className: "",
        template: Handlebars.compile($('#play_template').html()),
        events: {
            "click .button-plus": "like"
        }, 
        initialize: function() {
            this.model.bind('change', this.render, this);
        },
        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },
        like: function(e) {
            e.preventDefault();
            this.model.like();
        }
    });
    
    var PlayListView = Backbone.View.extend({
        tagName: "table",
        className: "zebra-striped",
        initialize: function() {
            this.model.bind('change', this.render, this);        
            this.model.bind('add', this.render, this);
            this.model.bind('remove', this.render, this);
            this.model.bind('reset', this.render, this);
        },
        render: function() {
            var table = this.el;
            $(table).empty();
            
            this.model.each(function(play) {
               var view = new PlayView({model: play});
               $(table).append(view.render().el);
            });
            
            return this;
        },
    });
    
    var SidebarItemView = Backbone.View.extend({
        tagName:  "tr",
        className: "",
        template: Handlebars.compile($('#sidebar_template').html()),
        initialize: function() {
            this.model.bind('change', this.render, this);
        },
        render: function() {
            var json = this.model.toJSON();
            
            if (this.viewType == 'like_count') {
                json.count = json.like_count;
                json.percentage = json.like_percentage;
            }
            else {
                json.count = json.play_count;
                json.percentage = json.play_percentage;
            }
            
            $(this.el).html(this.template(json));
            return this;
        }
    });
    
    var SidebarListView = Backbone.View.extend({
        tagName: "table",
        className: "zebra-striped",
        initialize: function() {
            this.model.bind('change', this.render, this);        
            this.model.bind('add', this.render, this);
            this.model.bind('remove', this.render, this);
            this.model.bind('reset', this.render, this);
        },
        render: function() {
            var viewType = this.viewType,
                table = this.el;
                
            $(table).empty();
            
            this.model.each(function(item) {
               var view = new SidebarItemView({model: item });
               view.viewType = viewType;
               $(table).append(view.render().el);
            });
            
            return this;
        },
    });
    
    var AppView = Backbone.View.extend({
        el: $("#app"),
        initialize: function() {
            $('#top-sidebar').html(SidebarTopSongsView.el);
            $('#popular-sidebar').html(SidebarPopularSongsView.el);
        },
        setActiveMenuItem: function(selector) {
    	    this.$('.topbar').find('.active').removeClass('active');
    	    this.$('.topbar').find(selector).addClass('active');
    	},
    	setTitle: function(title) {
    	    this.$('#page-title').html(title);
    	},
        showAllPlays: function() {
            this.setActiveMenuItem('.menu-all');
            this.setTitle('All Tracks <small>from the beginning of time</small>');
            
            Plays.fetchFromServer(-1);
            $('#song-list').html(PlaysView.el);
        },
        showRecentPlays: function() {
            this.setActiveMenuItem('.menu-recent');
	        this.setTitle('Recent Tracks <small>Last 15 plays</small>');
	        
	        Plays.fetchFromServer(15);
            $('#song-list').html(PlaysView.el);
        },
        showTopSongs: function() {
            this.setActiveMenuItem('.menu-top');
	        this.setTitle('Top Tracks <small>Top 15 of last week</small>');
	        
	        TopSongs.fetchTopFromServer(15);
	        $('#song-list').html(TopSongsView.el);
        },
        showPopularSongs: function() {
            this.setActiveMenuItem('.menu-popular');
	        this.setTitle('Popular Tracks <small>Top 15 of last week</small>');
        
            PopularSongs.fetchPopularFromServer(15);
	        $('#song-list').html(PopularSongsView.el);
        }
    });
    
    var AppRouter = Backbone.Router.extend({
	    routes: {
	        "/all": "showAll",
	        "/recent": "showRecent",
	        "/top": "showTopSongs",
	        "/popular": "showPopularSongs",
	        "": "showRecent",
	    },
	    
	    showAll: function() { 
	        App.showAllPlays(); 
	    },
	    showRecent: function() { 
	        App.showRecentPlays(); 
	    },
	    showTopSongs: function() { 
	        App.showTopSongs(); 
	    },
	    showPopularSongs: function() { 
	        App.showPopularSongs();
	    },
	});
    
    window.SidebarTopSongs = new SongList();
    window.SidebarTopSongsView = new SidebarListView({ 
        model: SidebarTopSongs, 
    });
    window.SidebarTopSongsView.viewType = "play_count";
    
    window.SidebarPopularSongs = new SongList();
    window.SidebarPopularSongsView = new SidebarListView({ 
        model: SidebarPopularSongs,  
    });
    window.SidebarPopularSongsView.viewType = "like_count";
    
    window.Plays = new PlayList();    
    window.PlaysView = new PlayListView({ 
        model: Plays 
    });
    
    window.TopSongs = new SongList();    
    window.TopSongsView = new SongListView({ 
        model: TopSongs, 
    });
    window.TopSongsView.viewType = 'play_count';
    
    window.PopularSongs = new SongList(); 
    window.PopularSongsView = new SongListView({ 
        model: PopularSongs, 
    });
    window.PopularSongsView.viewType = 'like_count';
	
	window.App = new AppView();
	window.Router = new AppRouter();
	
	SidebarTopSongs.fetchTopFromServer(10);
	SidebarPopularSongs.fetchPopularFromServer(10);
	
	setInterval(function() {
	    TopSongs.fetchTopFromServer(15);
	    PopularSongs.fetchPopularFromServer(15);
	    SidebarTopSongs.fetchTopFromServer(10);
    	SidebarPopularSongs.fetchPopularFromServer(10);
	}, 1000);
	
	Backbone.history.start();
});