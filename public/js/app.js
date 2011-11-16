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
		
		if (timeDiffInMinutes < 2) {
		    timeStr = 'now';
		}	
		else if (timeDiffInMinutes < 15) {
		    timeStr = Math.round(timeDiffInMinutes) + ' min ago';
		}
		else if (isToday) {
		    timeStr = time.toString('HH:mm');
		}
		else if(isYesterday) {
		    timeStr = 'yesterday ' + time.toString('HH:mm');
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
	
	function getSpotifyLink(artist, title, callback) {
		var queryString = artist + '+' + title;
		console.log('fetching spotify link: ' + queryString);
		$.getJSON('api/spotify/track', { query: queryString }, 
			function(result) {
				if (result.tracks.length > 0) {
					var link = result.tracks[0].href;
					console.log('spotify link for ' + queryString + ': ' + link);
					callback(link);
				} 
				else {
					console.log('no spotify link for ' + queryString);
				}				
			}
		);
	}
	
	/// User
	
	var User = Backbone.Model.extend({
        setUserData: function() {
            var user = this;
            FB.api('/me', function(response) {
                console.log('user logged in');
                console.log(response);
                user.set({
                   'username': response.name,
                   'userid': response.id,
                   'isLoggedIn': true
                });
                
                $('#username').text('Hallo, ' + response.first_name + '!');
            });
	    },
	    check: function() {
	        var user = this;
	        FB.getLoginStatus(function(response) {
	            if (response.authResponse) {
	                user.setUserData();
	            }
	            else {
	                console.log('unknown user');
	                user.set({
    	               'username': null,
    	               'userid': null,
    	               'isLoggedIn': false
    	            });
	            }
	        });
	    },
	    login: function() {
	        var user = this;
	        FB.login(function(response) {
               if (response.authResponse) {
                   user.setUserData();
               }
               else {
                   console.log('user cancelled login');
               }
            });
	    },
	    logout: function() {
	        var user = this;
	        FB.logout(function(response) {
	            user.set({
	               'username': null,
	               'userid': null,
	               'isLoggedIn': false
	            });
	        });
	    } 
	});
	
	/// Song
	
	var Song = Backbone.Model.extend({
	    like: function() {
	        likeSong(this.get('songId'), user);
	    },
	    setSpotifyLink: function() {
			var song = this;
			getSpotifyLink(this.get('artist'), this.get('title'), function(link) {
				song.set({ spotify: link });
			});
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
		    
		    song.setSpotifyLink();
		    
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
	    },
	    updateTime: function() {
	    	var time = this.get('originalTime');
	    	
	    	this.set({ 
	    		time:  getTimeStr(time),
	    		isRecent: isRecentTime(time)
	    	});
	    },
	    setSpotifyLink: function() {
			var play = this;
			getSpotifyLink(this.get('artist'), this.get('title'), function(link) {
				play.set({ spotify: link });
			});
		}
    }, // class properties
    {
        create: function(json) {      
            var play = new Play(),
            	time = new Date(json.time);

            play.set({ 
                songId: json.song_id,
                time: getTimeStr(time),
                originalTime: time,
                artist: json.artist,
                title: json.title,
                source: json.source,
                isRecent: isRecentTime(time)
            });
            
            play.setSpotifyLink();
            
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
           	var collection = this,
           		time = collection.last().get('originalTime').add({ seconds: -1});
           		
           	$.getJSON('api/plays', { until: time.toString(), count: count }, 
           	     function(items) {
   	       	        collection.add(_.map(items, Play.create));
          	 });
       },
       updateFromServer: function(count) {
       		var collection = this,
       			time = collection.first().get('originalTime').add({ seconds: 1});
       			
       		$.getJSON('api/plays', { since: time.toString(), count: count }, 
       		     function(items) {
       		     	items.reverse();
       		     	_.each(items, function(item) {
       		     		collection.add(Play.create(item), { at: 0 });
       		     		collection.remove(collection.last());
       		     	});
       		});
       },
       updateTimes: function() {
       		this.each(function(play) {
       			play.updateTime();
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
        templateRecent: Handlebars.compile($('#play_template_recent').html()),
        events: {
            "click .button-plus": "like"
        }, 
        initialize: function() {
            this.model.bind('change', this.render, this);
        },
        render: function() {            
            if (this.model.get('isRecent')) {
                $(this.el).html(this.templateRecent(this.model.toJSON()));
            }
            else {
                $(this.el).html(this.template(this.model.toJSON()));
            }
            
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
        initialize: function() {
            this.model.bind('add', this.add, this);
            this.model.bind('remove', this.remove, this);
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
        add: function(play, playList) {
        	var index = playList.indexOf(play),
        		table = this.el,
        		view = new PlayView({model: play}),
            	row = view.render().el;
                         
            if (index == 0) {
            	$(row).fadeIn('slow');
            	$(table).prepend(row);
            } 
            else {
            	$(row).fadeIn('fast');
            	$(table).append(row);
            }
        },
        remove: function(play, playList) {
        	var index = playList.indexOf(play),
        		table = this.el;
        	
        	$(table).find('tr').eq(index).remove();
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
        el: $("#container"),
        initialize: function() {
            $('#top-sidebar').html(SidebarTopSongsView.el);
            $('#popular-sidebar').html(SidebarPopularSongsView.el);
        },
        setActiveMenuItem: function(selector) {
    	    this.$('.topbar').find('.active').removeClass('active');
    	    this.$('.topbar').find(selector).addClass('active');
    	},
    	setTitle: function(title, subTitle) {
    	    this.$('#page-title h1').html(title);
			this.$('#page-title h3').html(subTitle);
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
            this.setTitle('All Tracks', 'from the beginning of time');
            
            Plays.fetchFromServer(-1);
            $('#song-list').html(PlaysView.el);
            
            this.clearFooter();
        },
        showRecentPlays: function() {
            this.setActiveMenuItem('.menu-recent');
	        this.setTitle('FM4 Playlist', 'Recent songs');
	        
	        Plays.fetchFromServer(30);
            $('#song-list').html(PlaysView.el);
            
            this.setFooter('<a href="">more</a>', function() { 
                Plays.fetchMoreFromServer(10);
            });
        },
        showTopSongs: function() {
            this.setActiveMenuItem('.menu-top');
	        this.setTitle('Top Tracks', 'Top 15 of last week');
	        
	        TopSongs.fetchTopFromServer(7, 15);
	        $('#song-list').html(TopSongsView.el);
	        
	        this.clearFooter();
        },
        showPopularSongs: function() {
            this.setActiveMenuItem('.menu-popular');
	        this.setTitle('Popular Tracks', 'Top 15 of last week');
        
            PopularSongs.fetchPopularFromServer(7, 15);
	        $('#song-list').html(PopularSongsView.el);
	        
	        this.clearFooter();
        },
        showUser: function(user) {
        	this.setActiveMenuItem('.menu-user');
        	this.setTitle('My Tracks', user);
        	
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
	
	/// Facebook
	
	window.facebookInitialized = function facebookInitialized() {
	    window.User.check();
	}
	
	$('#login').click(function() {
	   window.User.login();
	});
	
	$('#logout').click(function() {
	   window.User.logout();
	});
	
	/// Init stuff
	
	window.User = new User();
    
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
	
	setInterval(function() {
		Plays.updateFromServer();
	}, 10000);
	
	setInterval(function() {
		Plays.updateTimes();
	}, 60000);
	
	/*
	setInterval(function() {
	    TopSongs.fetchTopFromServer(15);
	    PopularSongs.fetchPopularFromServer(15);
	    SidebarTopSongs.fetchTopFromServer(10);
    	SidebarPopularSongs.fetchPopularFromServer(10);
	}, 1000);
	*/
	
	/// JQuery handlers
	
	/// fm4 popup
	
	$('#fm4-stream').click(function() {
		var href = $('#fm4-stream a').attr('href');
		window.open(href, 'player', 'width=320,height=260');
		return false;
	});
	
	Backbone.history.start();
});