define(["order!libs.jquery",
        "order!libs.underscore",
        "order!libs.backbone",
        "utils",
],
function($, _, Backbone, utils) {  

    var Song = Backbone.Model.extend({

        like: function() {
            utils.likeSong(this.get('songId'), CurrentUser.get('id'));
        }

        },  { 
        // class properties

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
        		time: utils.getTimeStr(new Date(json.time), true),
        	});
        	
        	if (json.spotify) {
        	    song.set({ spotify: json.spotify });
        	}

        	return song;
        }
    });

    var Songs = Backbone.Collection.extend({

        model: Song,

        fetchTopFromServer: function(daysAgo, count) {
            var collection = this;
            utils.log('fetching top songs: ' + daysAgo);
            $.getJSON('api/songs/top_plays', {
                count: count,
                since: utils.getDateAgo(daysAgo).toString()
            },
            function(items) {
                collection.reset(_.map(items, function(item) {
                    return Song.create(item, items[0].count);
                }));
            });
        },

        fetchPopularFromServer: function(daysAgo, count) {
            var collection = this;
            utils.log('fetching popular songs');
            $.getJSON('api/songs/top_likes', { 
                count: count,
                since: utils.getDateAgo(daysAgo).toString()
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
            utils.log('fetching liked songs');
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

    return {
        Song: Song,
        Songs: Songs
    };
});
