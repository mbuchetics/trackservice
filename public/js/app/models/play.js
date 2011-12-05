define(["order!libs.jquery",
        "order!libs.underscore",
        "order!libs.backbone",
        "utils",
],
function($, _, Backbone, utils) {  

    var Play = Backbone.Model.extend({

        like: function() {
            utils.likeSong(this.get('songId'), CurrentUser.get('id'));
        },

        updateTime: function() {
        	var time = this.get('originalTime');
        	
        	this.set({ 
        		time:  utils.getTimeStr(time),
        		isRecent: utils.isRecentTime(time)
        	});
        }

        },  {
        // class properties

        create: function(json) {      
            var play = new Play(),
            	time = new Date(json.time);

            play.set({ 
                songId: json.song_id,
                time: utils.getTimeStr(time),
                originalTime: time,
                artist: json.artist,
                title: json.title,
                source: json.source,
                isRecent: utils.isRecentTime(time),
            });
            
            if (json.spotify) {
        	    play.set({ spotify: json.spotify });
        	}
            
            return play;
        }
    });

    var Plays = Backbone.Collection.extend({

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

    return {
        Play: Play,
        Plays: Plays,
    };
});
