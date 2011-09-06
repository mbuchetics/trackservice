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
    fd = fs.openSync('tracklist.txt', 'a+'),
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

function addSong(song) {
    console.log('new song:'.underline.red);
    console.log(util.inspect(song).red);
    songs.push(song);

    var line = JSON.stringify(song);
    fs.write(fd, line + '\n', null);
    
    db.collection('songs', function(err, collection) {
        collection.insert(song);
    });
    
    return songs;
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
                        var found = false;
                        for (var i = songs.length - 1; i >= songs.length - foundSongs.length - 1; i--) {
                            if (songs[i] != undefined && songs[i].time - newSong.time == 0) {
                                found = true;
                                break;
                            }
                        };

                        if (!found) {
                            addSong(newSong);
                        }
                    });

                    console.log('last 5 songs:');
                    console.log(songs.slice(-5));
                    console.log('');         
                }
            });
        }
    });
}

function run() {  
    console.log('read songs from tracklist.txt'.green);

    if (path.existsSync('tracklist.txt')) {
        fs.readFileSync('tracklist.txt')
        .toString()
        .split('\n')
        .forEach(function (line) { 
            if(line[0] != '[') {
                try {     
                    var song = JSON.parse(line);
                    song.time = new Date(song.time);
                    songs.push(song);
                    console.log(song);
                } catch(e) {}
            }
        });
    }

    console.log('start tracking songs'.green);
    
    fs.write(fd, '[new session ' + new Date().toGMTString() + ']\n', null);

    var app = express.createServer();

    app.get('/', function(req, res) {
      res.send(
        "<html><body><h3>hello world</h3></body></html>");
    });

    app.get('/all', function(req, res) {
      res.send(
        "<html><body><h3>all songs</h3><pre><code>" + 
        JSON.stringify(songs, null, 4) + 
        "</code></pre></body></html>");
    });

    app.get('/last/:count?', function(req, res) {
        var count = req.params.count;
        if (count == undefined)
            count = 5;
        res.send(
            "<html><body><h3>last " + count + " songs</h3><pre><code>" + 
            JSON.stringify(songs.slice(-count), null, 4) + 
            "</code></pre></body></html>");
    });

    app.listen(process.env.PORT || 3000);

    getTracklist();
    setInterval(getTracklist, 120000);
}

function init(dbname, host, port, user, password) {
    console.log(config);
    
    db = new mongodb.Db(config.db, new mongodb.Server(config.host, config.port, {auto_reconnect:true}), {});
    db.open(function(err, db) {
        if (config.user) {
            db.authenticate(config.user, config.pw, function(err, success) { 
                console.log(success);
                if (success) {
                    run();
                } 
            });
        }
        else {
            run();
        }
    });
}

init();