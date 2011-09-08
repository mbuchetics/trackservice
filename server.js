var config = require('./config_deploy'),
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
    songs = [],
    jquerySrc = fs.readFileSync("./jquery-1.6.2.min.js").toString(),
    db;
    
function getTime(timeStr) {
    var now = new Date(),
    hour = timeStr.substring(0,2),
    minute = timeStr.substring(3,5),
    time = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);

    // previous day
    if (now - time < 0) {
        time.setDate(time.getDate() - 1);
    }

    return time;
}

function getSongsCollection(callback) {
    db.collection('songs', function(err, collection) {
        if (!err) {
            callback(collection);
        }
    });
}

function addSong(song) {
    songs.push(song);
    
    getSongsCollection(function(collection) {
        collection.insert(song);
        collection.ensureIndex({ time: -1}, function() {});
        collection.ensureIndex({ artist: 1 }, function() {});
        console.log('added song to db:'.underline.red);
        console.log(util.inspect(song).red);
    });
    
    return songs;
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

    app.get('/', function(req, res) {
      res.send(
        "<html><body><h3>hello world, it's" + new Date() + "</h3></body></html>");
    });

    app.get('/all', function(req, res) {
        getSongs(0, function(songs) {
            res.send(
                "<html><body><h3>all songs</h3><pre><code>" + 
                JSON.stringify(songs, null, 4) + 
                "</code></pre></body></html>");
        });
    });

    app.get('/last/:count?', function(req, res) {
        var count = req.params.count;
        if (count == undefined) {
            count = 5;
        }
        else {
            count = parseInt(count);
        }
            
        getSongs(count, function(songs) {
            res.send(
                "<html><body><h3>last " + count + " songs</h3><pre><code>" + 
                JSON.stringify(songs, null, 4) + 
                "</code></pre></body></html>");
        });
    });

    app.listen(process.env.PORT || 3000);

    getTracklist();
    //setInterval(getTracklist, 120000);
    setInterval(getTracklist, 60000);
}

function init(dbname, host, port, user, password) {
    console.log('trying to connect to db');
    console.log(config);
    
    db = new mongodb.Db(config.db, new mongodb.Server(config.host, config.port, {auto_reconnect:true}), {});
    db.open(function(err, db) {
        if (!err) {
            if (config.user) {
                db.authenticate(config.user, config.pw, function(err, success) { 
                    if (!err && success) {
                        run();
                    } 
                    else {
                        console.log('error authenticating db'.red);
                    }
                });
            }
            else {
                run();
            }
        }
        else {
            console.log('error opening db'.red);
        }
    });
}

init();