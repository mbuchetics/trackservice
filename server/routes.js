var db = require('./database.js'),
	request = require('request');

function getParameters(req) {
    var paramCount = req.param('count'),
        paramSince = req.param('since'),
        paramUntil = req.param('until'),
        paramUser = req.param('user');
        
    return {
        count: paramCount ? parseInt(paramCount) : 10,
        timeUntil: paramUntil ? new Date(paramUntil) : new Date(),
        timeSince:  paramSince ? new Date(paramSince) : new Date(0),
        user: paramUser
    };
}

module.exports = function(app) {

	/// artists
	
	app.get('/api/artists/top_plays', function(req, res) {
		var params = getParameters(req);
		
		console.log('/api/artists/top_plays');
		console.log(params);
		
		db.getTopPlayedArtists(
			{ time: { '$lte': params.timeUntil, '$gte': params.timeSince } }, 
			params.count,
			function(artists) { res.json(artists); }
		);
	});
    
    /// songs
    
    app.get('/api/songs', function(req, res) {
        var params = getParameters(req);
        
        console.log('/api/songs');
        console.log(params);
  
        db.getSongs(
            { last_time: { '$lte': params.timeUntil, '$gte': params.timeSince } }, 
            { last_time: -1 }, 
            params.count, 
            function(songs) { res.json(songs); }
        );
    });
    
    app.get('/api/songs/top_plays', function(req, res) {
        var params = getParameters(req);

        console.log('/api/songs/top_plays');
        console.log(params);
        
        db.getTopPlayedSongs(
        	{ time: { '$lte': params.timeUntil, '$gte': params.timeSince } }, 
        	params.count,
        	function(songs) { res.json(songs); }
        );
    });
    
    app.get('/api/songs/top_likes', function(req, res) {
        var params = getParameters(req);

        console.log('/api/songs/top_likes');
        console.log(params);
        
        db.getTopLikedSongs(
        	{ time: { '$lte': params.timeUntil, '$gte': params.timeSince } }, 
        	params.count,
        	function(songs) { res.json(songs); }
        );
    });
    
    app.get('/api/songs/:songId', function(req, res) {
        var songId = req.params.songId;

        console.log('/api/songs/' + songId);
  
        db.getSong({ _id: db.toObjectID(songId) }, function(song) {
            res.json(song);
        });
    });
    
    /// plays
    
    app.get('/api/plays', function(req, res) {
        var params = getParameters(req);
        
        console.log('/api/plays');
        console.log(params);
        
        db.getPlays(
            { time: { '$lte': params.timeUntil, '$gte': params.timeSince } }, 
            { time: -1 }, 
            params.count, 
            function(plays) { res.json(plays); }
        );
    });
    
    app.get('/api/plays/:songId', function(req, res) {
        var songId = req.params.songId;

        console.log('/api/plays/' + songId);
  
        db.getPlays({ song_id: db.toObjectID(songId) }, { time: -1 }, 0, function(plays) {
            res.json(plays);
        });
    });
    
    /// likes
    
    app.get('/api/likes', function(req, res) {
        var params = getParameters(req),
        	filter;
        
        console.log('/api/likes');
        console.log(params);
        
        if (params.user) {
        	filter = { user: params.user, time: { '$lte': params.timeUntil, '$gte': params.timeSince } };
        }
        else {
        	filter = { time: { '$lte': params.timeUntil, '$gte': params.timeSince } };
        }
        
        db.getLikesExt(
            filter, 
            { time: -1 }, 
            params.count, 
            function(likes) { res.json(likes); }
        );
    });
    
    app.get('/api/likes/:songId', function(req, res) {
        var songId = req.params.songId;

        console.log('/api/likes/' + songId);
  
        db.getLikes({ song_id: db.toObjectID(songId) }, { time: -1 }, 0, function(likes) {
            res.json(likes);
        });
    });
    
    app.post('/api/likes/:songId', function(req, res) {
        var songId = req.params.songId,
            user = req.param('user');
        
        console.log('/api/likes/' + songId);
        
        db.addLike(db.toObjectID(songId), user);
        
        res.json({ ok: true });
    });
    
    app.get('/api/test1', function(req, res) {
    	var params = getParameters(req);
    	
    	db.getTopLikedSongs(
    		{ time: { '$lte': params.timeUntil, '$gte': params.timeSince } }, 
    		params.count,
    		function(songs) { res.json(songs); });
    });
	
	/// spotify
	
	app.get('api/spotify', function(req, res) {
		var query = req.param('query');

		request({
		    uri: 'http://http://ws.spotify.com/search/1/track.json?q=' + query,
		    json: true,
		    }, 
		    function(error, res2, result) {
			    if (!error && res2.statusCode == 200) {
					res.json(result);
			    }
			});
	});
    
    app.get('*', function(req, res) {    
        res.writeHead(404);
        res.end();
    });
};