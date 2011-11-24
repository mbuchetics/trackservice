/*global $, document, Handlebars, _ */

// main app
// ========

define(["order!libs.jquery",
        "order!libs.underscore",
        "order!libs.backbone", 
        "libs.handlebars", 
        "libs.json2", 
        "libs.date" 
    ],
    function($, _, Backbone, Handlebars) {
        var host = window.location.hostname,
	    sidebarDaysAgo = 7;

	    function getDateAgo(daysAgo) {
	        return Date.today().add({days: -daysAgo});
	    }
	
	    function getTimeStr(time, short) {
		    var now = new Date(),
			    day = time.clone().clearTime(),
			    today = now.clone().clearTime(),
			    isToday = day.equals(Date.today()),
			    isYesterday = day.equals(Date.today().add(-1).day()),
			    timeDiff = now.getTime() - time.getTime(),
			    timeDiffInMinutes = timeDiff / 1000 / 60,
			    timeStr;
		
		    if (timeDiffInMinutes < 2) {
		        timeStr = 'just now';
		    }	
		    else if (timeDiffInMinutes < 15) {
		        timeStr = Math.round(timeDiffInMinutes) + ' min ago';
		    }
		    else if (isToday) {
		        timeStr = time.toString('HH:mm');
		    }
		    else if (short) {
			    if(isYesterday) {
		        	timeStr = 'yesterday';
			    }
			    else {
		        	timeStr = time.toString('d. MM.');
			    }
		    }
		    else {
			    if(isYesterday) {
		        	timeStr = 'yesterday ' + time.toString('HH:mm');
			    }
			    else {
		        	timeStr = time.toString('d. MMM. HH:mm');
			    }
		    }		
		
		    return timeStr;
	    }
	
	    function isRecentTime(time) {
		    var now = new Date(),
			    timeDiff = now.getTime() - time.getTime(),
			    timeDiffInMinutes = timeDiff / 1000 / 60;
			
		    return timeDiffInMinutes < 15;			
	    }
	
	    function likeSong(songId, userId) {
	        $.post('api/likes/' + songId, { user: userId }, function(data) {
	           console.log('song like ok'); 
	           SidebarPopularSongs.fetchPopularFromServer(sidebarDaysAgo, 10);
	           UserLikes.fetchLikedFromServer(userId, 15);
	        });
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
                       'id': response.id,
                       'isLoggedIn': true
                    });
                    
                    UserLikes.fetchLikedFromServer(response.id, 15);
                    
                    $('#login').hide();
                    $('#logout').show();
                    
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
        	               'id': null,
        	               'isLoggedIn': false
        	            });
        	            
        	            $('#login').show();
                        $('#logout').hide();
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
	                   'id': null,
	                   'isLoggedIn': false
	                });
	                $('#login').show();
                    $('#logout').hide();
	            });
	        } 
	    });
	
	    /// Song
	
	    var Song = Backbone.Model.extend({
	        like: function() {
	            likeSong(this.get('songId'), CurrentUser.get('id'));
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
		        
                if (json.spotify) {
                    song.set({ spotify: json.spotify });
                }
                
		        return song;
	        },
	        createFromLike: function(json) {
	        	var song = new Song();
	        	
	        	song.set({
	        		songId: json._id,
	        		artist: json.artist,
	        		title: json.title,
	        		time: getTimeStr(new Date(json.time), true),
	        	});
	        	
	        	if (json.spotify) {
	        	    song.set({ spotify: json.spotify });
	        	}
	        	
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
            fetchLikedFromServer: function(userId, count) {
	            var collection = this;
	            console.log('fetching liked songs');
	            $.getJSON('api/likes', { 
	                user: userId,
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
                likeSong(this.get('songId'), CurrentUser.get('id'));
	        },
	        updateTime: function() {
	        	var time = this.get('originalTime');
	        	
	        	this.set({ 
	        		time:  getTimeStr(time),
	        		isRecent: isRecentTime(time)
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
                    isRecent: isRecentTime(time),
                });
                
                if (json.spotify) {
	        	    play.set({ spotify: json.spotify });
	        	}
                
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
            templateSong: Handlebars.compile($('#sidebar_song_template').html()),
            templateLike: Handlebars.compile($('#sidebar_like_template').html()),
            initialize: function() {
                this.model.bind('change', this.render, this);
            },
            render: function() {
                var json = this.model.toJSON();
                
                if (this.model.has('count')) {
                    $(this.el).html(this.templateSong(json));
                }
                else {
                    $(this.el).html(this.templateLike(json));
                }
                
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
                   $(table).append(view.render().el);
                });
                
                return this;
            },
        });
        
        /// AppView
        
        var AppView = Backbone.View.extend({
            el: $("#container"),
            initialize: function() {
                $('#user-sidebar').html(SidebarUserView.el);
                $('#top-sidebar').html(SidebarTopSongsView.el);
                $('#popular-sidebar').html(SidebarPopularSongsView.el);
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
            showRecentPlays: function() {
	            this.setTitle('FM4 Playlist', 'Recent songs');
	            
	            Plays.fetchFromServer(30);
                $('#song-list').html(PlaysView.el);
                
                this.setFooter('<a href="">more</a>', function() { 
                    Plays.fetchMoreFromServer(10);
                });
            },
            showUser: function(userId) {
            	this.setTitle('My Tracks', userId);
            	
            	UserLikes.fetchLikedFromServer(userId, 15);
            	$('#song-list').html(UserLikesView.el);
            	this.clearFooter();
            }
        });
        
        /// AppRouter
        
        var AppRouter = Backbone.Router.extend({
	        routes: {
	            "/user": "showCurrentUser",
	            "/user/:userId": "showUser",
	            "": "showRecent",
	        },
	        
	        showRecent: function() { 
	            App.showRecentPlays(); 
	        },
	        showUser: function(userId) {
	        	App.showUser(userId);
	        },
	        showCurrentUser: function() {
	        	App.showUser(CurrentUser.id);
	        }
	    });

        function facebookInit(d) {

            fbAsyncInit = function() {
                FB.init({
                    appId      : '252955554753527', // App ID
	                channelURL : '//trackservice.localhost.com:3000/channel.html', // Channel File
                    //appId      : '274629705912895', // App ID
                    //channelURL : '//trackservice.heroku.com/channel.html', // Channel File
                    status     : true, // check login status
                    cookie     : true, // enable cookies to allow the server to access the session
                    oauth      : true, // enable OAuth 2.0
                    xfbml      : true  // parse XFBML
                });

                CurrentUser.check();
            };

            var js, id = 'facebook-jssdk'; 
            if (d.getElementById(id)) {return;}
            js = d.createElement('script'); js.id = id; js.async = true;
            js.src = "//connect.facebook.net/en_US/all.js";
            d.getElementsByTagName('head')[0].appendChild(js);
        }

        var init = function() {
            $(document).ready(function() {
                
                /// Facebook

                facebookInit(document);

	            $('#login').click(function() {
	               CurrentUser.login();
	            });
	
	            $('#logout').click(function() {
	               CurrentUser.logout();
	            });
	
	            /// Init stuff
	
	            window.CurrentUser = new User();
	            window.UserLikes = new SongList();
	
                window.SidebarUserView = new SidebarListView({ 
                    model: UserLikes
                });
                
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

	            /// JQuery handlers
	
	            /// fm4 popup
	
	            $('#fm4-stream').click(function() {
		            var href = $('#fm4-stream a').attr('href');
		            window.open(href, 'player', 'width=320,height=260');
		            return false;
	            });
	
	            Backbone.history.start();
            });
        }

        return { "init": init };
    }
);
