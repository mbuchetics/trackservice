var config = require('./config'),
    express = require('express'),
    request = require('request'),
    jsdom = require("jsdom"),
    util = require('util'),
    fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    colors = require('colors'),
    mongodb = require('mongodb'),
    async = require('async'),
    datetime = require('datetime'),
    jQuerySrc = fs.readFileSync('public/js/externals/jquery-1.6.3.min.js').toString(),
    db;
    
var useJQuery = function(body, callback) {
    jsdom.env ({
        html: body,
        src: [ jQuerySrc ],                
        done: function (err, window) {
            callback(window.jQuery);            
            // memory leak if we don't close the window ...
            window.close();
        }
    });
}
    
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
        source: song.source,
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
    request('http://hop.orf.at/img-trackservice/fm4.html', function(error, res, html) {
        if (!error && res.statusCode == 200) {
            parseTracklist(html);
        }
    });
}

function getTracklistTestLocal() {
    fs.readFile('fm4.html', function(err, html) {
        if (!err) {
            parseTracklist(html);
        }
    });
}

function getTracklistTestRemote() {
    request('http://10.42.99.135/~matthias/fm4.html', function(error, res, html) {
        if (!error && res.statusCode == 200) {
            parseTracklist(html);
        }
    });
}

function parseTracklist(html) {
    useJQuery(html, function($) {
        var now = new Date();
        console.log('update: ' + now.toGMTString());

        var foundSongs = [];

        $('div').each(function(index) {
            var time = getTime($(this).text().substring(0, 5));
            var artist = $(this).find('.artist').html();
            var title = $(this).find('.tracktitle').html();

            var song = { 
                'time': time, 
                'artist': artist, 
                'title': title,
                'source': 'fm4',
            };
            
            var isDuplicate = _.any(foundSongs, function(element) {
                    return _.isEqual(element, song);
                });
                 
            if (isDuplicate) {
                console.log('isDupliate:');
                console.log(util.inspect(song));
            }
            else {
                foundSongs.push(song);
            }                    
        });
        
        foundSongs.forEach(function(newSong) {
            getSong(newSong, function(song) {
               if (!song) {
                   addSong(newSong);
               }
            });
        });
    });
}

function printMemory() {
    var mem = process.memoryUsage();
    console.log('mem: ' + mem.rss / 1024 / 1024);
}

function run() {  
    console.log('connected to db'.green);
    console.log('start tracking songs'.green);
    
    console.log('[new session ' + new Date().toGMTString() + ']');
    
    var app = express.createServer();
    
    app.use(express.staticCache());
    app.use(express.static(__dirname + '/public'));

    app.get('/api/all', function(req, res) {
        console.log('/api/all');
        
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
        
        console.log('/api/last/' + count);
  
        getSongs(count, function(songs) {
            res.json(songs);
        });
    });
    
    app.get('*', function(req, res) {    
        res.writeHead(404);
        res.end();
    })
    
    console.log('listening on port ' + config.port);

    app.listen(config.port);

    //getTracklistTestRemote();
    getTracklist();
    printMemory();
    
    //setInterval(getTracklist, 120000);
    setInterval(getTracklist, 60000);
    setInterval(printMemory, 60000);
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