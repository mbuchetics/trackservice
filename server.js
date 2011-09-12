var config = require('./config'),
    express = require('express'),
    request = require('request'),
    jsdom = require("jsdom"),
    util = require('util'),
    fs = require('fs'),
    path = require('path'),
    underscore = require('underscore'),
    colors = require('colors'),
    mongodb = require('mongodb'),
    async = require('async'),
    datetime = require('datetime'),
    jquerySrc = fs.readFileSync("externals/jquery-1.6.2.min.js").toString(),
    db;
    
function getTime(timeStr) {
    var now = new Date(),
        hour = timeStr.substring(0,2),
        minute = timeStr.substring(3,5), 
        time = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0));
        
    // fm4 trackservice times are GMT+0200
    time.setHours(time.getHours() - 2);

    // previous day
    if (now - time < 0) {
        time.setDate(time.getDate() - 1);
    }

    return time;
}

function getSongPretty(song) {
    return { 
        time: datetime.format(song.time, '%d.%m., %T'),
        timeAgo: datetime.formatAgo(song.time),
        artist: song.artist,
        title: song.title,
    };
}

function getSongsCollection(callback) {
    db.collection('songs', function(err, collection) {
        if (!err) {
            callback(collection);
        }
    });
}

function addSong(song) {
    getSongsCollection(function(collection) {
        collection.insert(song);
        collection.ensureIndex({ time: -1}, function() {});
        collection.ensureIndex({ artist: 1 }, function() {});
        console.log('added song to db:'.underline.red);
        console.log(util.inspect(song).red);
    });
}

function getSongs(count, callback) {
    if (count < 0) {
        count = 0;
    }
    
    getSongsCollection(function(collection) {
        collection.find().sort({ time : -1 }).limit(count).toArray(function(err, results) {
           if (!err) {
               callback(results);
           } 
        });
    });
}

function getSong(song, callback) {
    getSongsCollection(function(collection) {
        collection.findOne({ time: song.time, artist: song.artist, title: song.title }, function(err, result) {
            if (!err) {
                callback(result);
            }
        }); 
    });
}

function getTracklist() {    
    request('http://hop.orf.at/img-trackservice/fm4.html', function(error, res, body) {
        if (!error && res.statusCode == 200) {
            jsdom.env ({
                html: body,
                src: [ jquerySrc ],                
                done: function (err, window) {
                    var now = new Date();
                    console.log('update: ' + now.toGMTString());

                    var foundSongs = [];

                    var $ = window.jQuery;

                    $('div').each(function(index) {
                        var time = getTime($(this).text().substring(0, 5));                       
                        var song = { 
                            'time': time, 
                            'artist': $(this).find('.artist').text(), 
                            'title': $(this).find('.tracktitle').text()
                        };

                        foundSongs.push(song);                 
                    });
                    
                    foundSongs.forEach(function(newSong) {
                        getSong(newSong, function(song) {
                           if (!song) {
                               addSong(newSong);
                           }
                           /* 
                           else {                           
                               console.log('already in db');
                               console.log(util.inspect(song).red);
                           }
                           */
                        });
                    });
                }
            });
        }
    });
}

function run() {  
    console.log('connected to db'.green);
    console.log('start tracking songs'.green);
    
    //fs.write(fd, '[new session ' + new Date().toGMTString() + ']\n', null);
    
    var app = express.createServer();
    
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');

    app.get('/', function(req, res) {
        res.render('index', { title: 'blub!' });
    });
    
    app.get('/list', function(req, res) {
        getSongs(0, function(songs) {
            res.render('songs', { 
                count: songs.length, 
                lastUpdated: datetime.formatAgo(songs[0].time),
                songs: underscore.map(songs, getSongPretty) 
            });
        });
    });    

    app.get('/api/all', function(req, res) {
        getSongs(0, function(songs) {
            res.json(songs);
        });
    });

    app.get('/api/last/:count?', function(req, res) {
        var count = req.params.count;
        if (count == undefined) {
            count = 5;
        }
        else {
            count = parseInt(count);
        }
            
        getSongs(count, function(songs) {
            res.json(songs);
        });
    });
    
    console.log('listening on port ' + config.port);

    app.listen(config.port);

    getTracklist();
    //setInterval(getTracklist, 120000);
    setInterval(getTracklist, 60000);
}

function init(dbname, host, port, user, password) {
    console.log('trying to connect to db');
    console.log(config);
    
    mongodb.connect(config.db_url, function(err, database) {
        if (!err) {
            db = database;
            run();
        }
        else {
            console.log('error connecting to db'.red);
        }
    });
}

init();