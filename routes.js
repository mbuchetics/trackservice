var db = require('./database.js');

module.exports = function(app) {
    app.get('/api/songs/all', function(req, res) {
        console.log('/api/songs/all');
        
        db.getSongs({}, { last_time: -1 }, 0, function(songs) {
            res.json(songs);
        });
    });

    app.get('/api/songs/recent', function(req, res) {
        var count = parseInt(req.param('count', 5));

        console.log('/api/songs/recent with count: ' + count);
  
        db.getSongs({}, { last_time: -1 }, count, function(songs) {
            res.json(songs);
        });
    });
    
    app.get('/api/songs/most_plays', function(req, res) {
        var count = parseInt(req.param('count', 5));

        console.log('/api/songs/most_plays with count: ' + count);
  
        db.getSongs({}, { play_count: -1 }, count, function(songs) {
            res.json(songs);
        });
    });
    
    app.get('/api/songs/most_likes', function(req, res) {
        var count = parseInt(req.param('count', 5));

        console.log('/api/songs/most_likes with count: ' + count);
  
        db.getSongs({}, { like_count: -1 }, count, function(songs) {
            res.json(songs);
        });
    });
    
    app.get('/api/songs/:songId', function(req, res) {
        var songId = req.params.songId;

        console.log('/api/songs/' + songId);
  
        db.getSong({ _id: db.toObjectID(songId) }, function(song) {
            res.json(song);
        });
    });
    
    app.get('/api/plays/all', function(req, res) {
        console.log('/api/plays/all');
        
        db.getPlays({}, { time: -1 }, 0, function(plays) {
            res.json(plays);
        });
    });

    app.get('/api/plays/recent', function(req, res) {
        var count = parseInt(req.param('count', 5));

        console.log('/api/plays/recent with count: ' + count);
  
        db.getPlays({}, { time: -1 }, count, function(plays) {
            res.json(plays);
        });
    });
    
    app.get('/api/plays/:songId', function(req, res) {
        var songId = req.params.songId;

        console.log('/api/plays/' + songId);
  
        db.getPlays({ song_id: db.toObjectID(songId) }, { time: -1 }, 0, function(plays) {
            res.json(plays);
        });
    });
    
    app.get('/api/likes/all', function(req, res) {
        console.log('/api/likes/all');
        
        db.getLikes({}, { time: -1 }, 0, function(likes) {
            res.json(likes);
        });
    });

    app.get('/api/likes/recent', function(req, res) {
        var count = parseInt(req.param('count', 5));

        console.log('/api/likes/recent with count: ' + count);
  
        db.getLikes({}, { time: -1 }, count, function(likes) {
            res.json(likes);
        });
    });
    
    app.get('/api/likes/:songId', function(req, res) {
        var songId = req.params.songId;

        console.log('/api/likes/' + songId);
  
        db.getLikes({ song_id: db.toObjectID(songId) }, { time: -1 }, 0, function(likes) {
            res.json(likes);
        });
    });
    
    app.put('/api/likes/:songId', function(req, res) {
        var user = req.param('user');

        console.log('/api/likes/' + songId + ': ' + user);
        
        db.addLike(db.toObjectID(songId), user);
        
        res.json({ ok: true });
    });
    
    app.get('*', function(req, res) {    
        res.writeHead(404);
        res.end();
    });
};