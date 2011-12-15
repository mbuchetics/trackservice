define(["order!libs.jquery",
        "order!libs.underscore",
        "order!libs.backbone", 
        "libs.handlebars", 
        "models",
        "views",
        "utils",
        "constants"
],
function($, _, Backbone, Handlebars, Models, Views, utils, constants) {
    
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
            this.setTitle('FM4&Spotify', 'Recent tracks');	            

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

    var init = function() {
        $(document).ready(function() {

            /// Init stuff

            window.CurrentUser = new Models.User();

            window.UserLikes = new Models.Songs();	
            window.SidebarUserView = new Views.SidebarItems({ 
                model: UserLikes
            });
            
            window.SidebarTopSongs = new Models.Songs();
            window.SidebarTopSongsView = new Views.SidebarItems({ 
                model: SidebarTopSongs
            });
            
            window.SidebarPopularSongs = new Models.Songs();
            window.SidebarPopularSongsView = new Views.SidebarItems({ 
                model: SidebarPopularSongs 
            });

            window.Plays = new Models.Plays();    
            window.PlaysView = new Views.Plays({ 
                model: Plays 
            });

            window.App = new AppView();
            window.Router = new AppRouter();

            SidebarTopSongs.fetchTopFromServer(constants.sidebarDaysAgo, 10);
            SidebarPopularSongs.fetchPopularFromServer(constants.sidebarDaysAgo, 10);

            setInterval(function() {
	            Plays.updateFromServer();
            }, 10000);

            setInterval(function() {
	            Plays.updateTimes();
            }, 60000);

            /// Facebook

            utils.facebookInit(document);

            $('#login').click(function() {
               CurrentUser.login();
            });

            $('#logout').click(function() {
               CurrentUser.logout();
            });

            /// fm4 popup

            $('#fm4-stream').click(function() {
	            var href = $('#fm4-stream a').attr('href');
	            window.open(href, 'player', 'width=320,height=260');
	            return false;
            });

            Backbone.history.start();
        });
    }

    return { 
        init: init 
    };
});
