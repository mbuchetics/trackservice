/*global $, document, Handlebars, _ */

// main app
// ========

$(function() {
	var host = window.location.hostname,
	    user = 'TestUser5',
	    sidebarDaysAgo = 7;

	function getDateAgo(daysAgo) {
	    return Date.today().add({days: -daysAgo});
	}
	
	function getTimeStr(time) {
		var now = new Date(),
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
		
		return timeStr;
	}
	
	function isRecentTime(time) {
		var now = new Date(),
			timeDiff = now.getTime() - time.getTime(),
			timeDiffInMinutes = timeDiff / 1000 / 60;
			
		return timeDiffInMinutes < 15;			
	}
	
	function likeSong(songId, user) {
	    $.post('api/likes/' + songId, { user: user }, function(data) {
	       console.log('song like ok'); 
	       SidebarPopularSongs.fetchPopularFromServer(sidebarDaysAgo, 10);
	    });
	}
	
	/// Song
	
	var Song = Backbone.Model.extend({
	    like: function() {
	        likeSong(this.get('songId'), user);
	    }
	},
	{ // class properties
	    create: function(json, maxCount) {
		    var song = new Song();
		    
		    song.set({
		       songId: json._id,
		       artist: json.artist,
		       title: json.title,
		       count: json.count,
		       percentage: maxCount > 0 ? json.count / maxCount * 95 : 0
		    });
		    
		    return song;
	    },
	    createFromLike: function(json) {
	    	var song = new Song();
	    	
	    	song.set({
	    		songId: json._id,
	    		artist: json.artist,
	    		title: json.title,
	    		time: getTimeStr(new Date(json.time)),
	    	});
	    	
	    	return song;
	    }
	});
	
	/// SongList
    
    var SongList = Backbone.Collection.extend({
        model: Song,
        fetchTopFromServer: function(daysAgo, count) {
            var collection = this;
            console.log('fetching top songs: ' + daysAgo);
            $.getJSON('api/songs/top_plays', {
                count: count,
                since: getDateAgo(daysAgo).toString()
            },
            function(items) {
                collection.reset(_.map(items, function(item) {
                    return Song.create(item, items[0].count);
                }));
            });
        },
        fetchPopularFromServer: function(daysAgo, count) {
            var collection = this;
            console.log('fetching popular songs');
            $.getJSON('api/songs/top_likes', { 
                count: count,
                since: getDateAgo(daysAgo).toString()
            }, 
            function(items) {
                collection.reset(_(items).select(function(item) { return item.count > 0; })
                    .map(function(item) {
                        return Song.create(item, items[0].count);
                    }
                ));
                
            });
        },
        fetchLikedFromServer: function(user, count) {
	        var collection = this;
	        console.log('fetching liked songs');
	        $.getJSON('api/likes', { 
	            user: user,
	            count: count,
	        }, 
	        function(items) {
	            collection.reset(_.map(items, function(item) {
	                return Song.createFromLike(item);
	            }));
	        });
        }
    });
    
    /// Play
    
    var Play = Backbone.Model.extend({
	    like: function() {
            likeSong(this.get('songId'), user);
	    }
    }, // class properties
    {
        create: function(json) {      
            var play = new Play(),
            	time = new Date(json.time);

            play.set({ 
                songId: json.song_id,
                time: getTimeStr(time),
                originalTime: json.time,
                artist: json.artist,
                title: json.title,
                source: json.source,
                isNew: isRecentTime(time)
            });
            
            return play;
        }
    });
    
    /// PlayList
    
    var PlayList = Backbone.Collection.extend({
       model: Play,
       fetchFromServer: function(count) {
           var collection = this;
           $.getJSON('api/plays', { count: count }, 
               function(items) {
	               collection.reset(_.map(items, Play.create));
       	   });
       },
       fetchMoreFromServer: function(count) {
           var collection = this;
           var lastPlay = collection.last();
           $.getJSON('api/plays', { until: lastPlay.get('originalTime'), count: count + 1 }, 
                function(items) {
   	               collection.add(_(items).rest(1).map(Play.create));
           });
       }
    });
    
    /// SongView
    
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
            $(this.el).html(this.template(json));
            return this;
        },
        like: function(e) {
            e.preventDefault();
            this.model.like();
        }
    });
    
    /// SongListView
    
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
            var table = this.el;
                
            $(table).empty();
            
            this.model.each(function(song) {
               var view = new SongView({model: song });
               $(table).append(view.render().el);
            });

            return this;
        },
    });
    
    /// PlayView
    
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
    
    /// PlayListView
    
    var PlayListView = Backbone.View.extend({
        tagName: "table",
        className: "zebra-striped",
        initialize: function() {
            this.model.bind('add', this.addOne, this);
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
        addOne: function(play) {
            var table = this.el;
            
            var view = new PlayView({model: play});
            var row = view.render().el;
            
            $(row).fadeIn();
            $(table).append(row);
            
        }
    });
    
    /// LikeView
        
    var LikeView = Backbone.View.extend({
        tagName:  "tr",
        className: "",
        template: Handlebars.compile($('#like_template').html()),
        events: {
        }, 
        initialize: function() {
            this.model.bind('change', this.render, this);
        },
        render: function() {
            var json = this.model.toJSON();
            $(this.el).html(this.template(json));
            return this;
        },
    });
    
    /// LikeListView
    
    var LikeListView = Backbone.View.extend({
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
            
            this.model.each(function(like) {
               var view = new LikeView({model: like });
               $(table).append(view.render().el);
            });

            return this;
        },
    });
    
    
    /// SidebarItemView
    
    var SidebarItemView = Backbone.View.extend({
        tagName:  "tr",
        className: "",
        template: Handlebars.compile($('#sidebar_template').html()),
        initialize: function() {
            this.model.bind('change', this.render, this);
        },
        render: function() {
            var json = this.model.toJSON();
            $(this.el).html(this.template(json));
            return this;
        }
    });
    
    /// SidebarListView
    
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
    
    /// AppView
    
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
    	setFooter: function(text, clickAction) {
    	    var footer = this.$('#song-list-footer').html(text);
    	    
    	    if (clickAction) {
    	        footer.click(function(e) {
    	            e.preventDefault();
    	            clickAction();
    	        });
    	    }
    	},
    	clearFooter: function() {
    		this.$('#song-list-footer').empty();
       	},
        showAllPlays: function() {
            this.setActiveMenuItem('.menu-all');
            this.setTitle('All Tracks <small>from the beginning of time</small>');
            
            Plays.fetchFromServer(-1);
            $('#song-list').html(PlaysView.el);
            
            this.clearFooter();
        },
        showRecentPlays: function() {
            this.setActiveMenuItem('.menu-recent');
	        this.setTitle('Recent Tracks <small>Last 15 plays</small>');
	        
	        Plays.fetchFromServer(15);
            $('#song-list').html(PlaysView.el);
            
            this.setFooter('<a href="">more</a>', function() { 
                Plays.fetchMoreFromServer(10);
            });
        },
        showTopSongs: function() {
            this.setActiveMenuItem('.menu-top');
	        this.setTitle('Top Tracks <small>Top 15 of last week</small>');
	        
	        TopSongs.fetchTopFromServer(7, 15);
	        $('#song-list').html(TopSongsView.el);
	        
	        this.clearFooter();
        },
        showPopularSongs: function() {
            this.setActiveMenuItem('.menu-popular');
	        this.setTitle('Popular Tracks <small>Top 15 of last week</small>');
        
            PopularSongs.fetchPopularFromServer(7, 15);
	        $('#song-list').html(PopularSongsView.el);
	        
	        this.clearFooter();
        },
        showUser: function(user) {
        	this.setActiveMenuItem('.menu-user');
        	this.setTitle('My Tracks <small>' + user + '</small');
        	
        	UserLikes.fetchLikedFromServer(user, 15);
        	$('#song-list').html(UserLikesView.el);
        	this.clearFooter();
        }
    });
    
    /// AppRouter
    
    var AppRouter = Backbone.Router.extend({
	    routes: {
	        "/all": "showAll",
	        "/recent": "showRecent",
	        "/top": "showTopSongs",
	        "/popular": "showPopularSongs",
	        "/user": "showCurrentUser",
	        "/user/:user": "showUser",
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
	    showUser: function(user) {
	    	App.showUser(user);
	    },
	    showCurrentUser: function() {
	    	App.showUser(user);
	    }
	});
	
	/// Init stuff
    
    window.SidebarTopSongs = new SongList();
    window.SidebarTopSongsView = new SidebarListView({ 
        model: SidebarTopSongs
    });
    
    window.SidebarPopularSongs = new SongList();
    window.SidebarPopularSongsView = new SidebarListView({ 
        model: SidebarPopularSongs 
    });

    window.Plays = new PlayList();    
    window.PlaysView = new PlayListView({ 
        model: Plays 
    });
    
    window.TopSongs = new SongList();    
    window.TopSongsView = new SongListView({ 
        model: TopSongs 
    });

    window.PopularSongs = new SongList(); 
    window.PopularSongsView = new SongListView({ 
        model: PopularSongs
    });
    
    window.UserLikes = new SongList();
    window.UserLikesView = new LikeListView({
    	model: UserLikes
    });

	window.App = new AppView();
	window.Router = new AppRouter();
	
	SidebarTopSongs.fetchTopFromServer(sidebarDaysAgo, 10);
	SidebarPopularSongs.fetchPopularFromServer(sidebarDaysAgo, 10);
	
	/*
	setInterval(function() {
	    TopSongs.fetchTopFromServer(15);
	    PopularSongs.fetchPopularFromServer(15);
	    SidebarTopSongs.fetchTopFromServer(10);
    	SidebarPopularSongs.fetchPopularFromServer(10);
	}, 1000);
	*/
	
	$('#fm4-stream').click(function() {
		var href = $('#fm4-stream a').attr('href');
		window.open(href, 'player', 'width=320,height=260');
		return false;
	});
	
	Backbone.history.start();
});