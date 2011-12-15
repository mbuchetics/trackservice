var db = require('./database.js'),
    header = { "Access-Control-Allow-Origin": "*" };

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
	    db.getTopPlayedArtists({
	        time: {
	            '$lte': params.timeUntil,
	            '$gte': params.timeSince
	        }
	    }, params.count, function(artists) {
	        res.json(artists, header);
	    }, function() {
	        res.json('error', 500);
	    });
	});
    
    /// songs
    
    app.get('/api/songs', function(req, res) {
        var params = getParameters(req);
        console.log('/api/songs');
        console.log(params);
        db.getSongs({
            last_time: {
                '$lte': params.timeUntil,
                '$gte': params.timeSince
            }
        }, {
            last_time: -1
        }, params.count, function(songs) {
            res.json(songs, header);
        }, function() {
            res.json('error', 500);
        });
    });
    
    app.get('/api/songs/top_plays', function(req, res) {
        var params = getParameters(req);
        console.log('/api/songs/top_plays');
        console.log(params);
        db.getTopPlayedSongs({
            time: {
                '$lte': params.timeUntil,
                '$gte': params.timeSince
            }
        }, params.count, function(songs) {
            res.json(songs, header);
        }, function() {
            res.json('error', 500);
        });
    });
    
    app.get('/api/songs/top_likes', function(req, res) {
        var params = getParameters(req);
        console.log('/api/songs/top_likes');
        console.log(params);
        db.getTopLikedSongs({
            time: {
                '$lte': params.timeUntil,
                '$gte': params.timeSince
            }
        }, params.count, function(songs) {
            res.json(songs, header);
        }, function() {
            res.json('error', 500);
        });
    });
    
    app.get('/api/songs/:songId', function(req, res) {
        var songId = req.params.songId;
        console.log('/api/songs/' + songId);
        db.getSong({
            _id: db.toObjectID(songId)
        }, function(song) {
            res.json(song, header);
        }, function() {
            res.json('error', 500);
        });
    });
    
    /// plays
    
    app.get('/api/plays', function(req, res) {
        var params = getParameters(req);
        console.log('/api/plays');
        console.log(params);
        db.getPlays({
            time: {
                '$lte': params.timeUntil,
                '$gte': params.timeSince
            }
        }, {
            time: -1
        }, params.count, function(plays) {
            res.json(plays, header);
        }, function() {
            res.json('error', 500);
        });
    });
    
    app.get('/api/plays/:songId', function(req, res) {
        var songId = req.params.songId;
        console.log('/api/plays/' + songId);
        db.getPlays({
            song_id: db.toObjectID(songId)
        }, {
            time: -1
        }, 0, function(plays) {
            res.json(plays, header);
        }, function() {
            res.json('error', 500);
        });
    });
    
    /// likes
    
    app.get('/api/likes', function(req, res) {
        var params = getParameters(req),
            filter;
        console.log('/api/likes');
        console.log(params);
        if (params.user) {
            filter = {
                user: params.user,
                time: {
                    '$lte': params.timeUntil,
                    '$gte': params.timeSince
                }
            };
        }
        else {
            filter = {
                time: {
                    '$lte': params.timeUntil,
                    '$gte': params.timeSince
                }
            };
        }
        db.getLikesExt(
        filter, {
            time: -1
        }, params.count, function(likes) {
            res.json(likes, header);
        });
    }, function() {
        res.json('error', 500);
    });
    
    app.get('/api/likes/:songId', function(req, res) {
        var songId = req.params.songId;
        console.log('/api/likes/' + songId);
        db.getLikes({
            song_id: db.toObjectID(songId)
        }, {
            time: -1
        }, 0, function(likes) {
            res.json(likes, header);
        }, function() {
            res.json('error', 500);
        });
    });
    
    app.post('/api/likes/:songId', function(req, res) {
        var songId = req.params.songId,
            user = req.param('user');
        console.log('/api/likes/' + songId);
        db.addLike(db.toObjectID(songId), user);
        res.json({
            ok: true
        });
    });
    
    app.get('/api/test', function(req, res) {
        var params = getParameters(req);
        db.getTopLikedSongs({
            time: {
                '$lte': params.timeUntil,
                '$gte': params.timeSince
            }
        }, params.count, function(songs) {
            res.json(songs, header);
        }, function() {
            res.json('error', 500);
        });
    });
    
    app.get('*', function(req, res) {
        res.writeHead(404, header);
        res.end();
    });
};
