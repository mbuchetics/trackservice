var request = require('request'),
    jsdom = require("jsdom"),
    util = require('util'),
    fs = require('fs'),
    path = require('path'),
    underscore = require('underscore'),
    colors = require('colors'),
    songs = [];

var jquerySrc = fs.readFileSync("./jquery-1.6.2.min.js").toString();

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

var fd = fs.openSync('tracklist.txt', 'a+');
fs.write(fd, '[new session ' + new Date().toGMTString() + ']\n', null);

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
                            console.log('new song:'.underline.red);
                            console.log(util.inspect(newSong).red);
                            songs.push(newSong);

                            var line = JSON.stringify(newSong);

                            fs.write(fd, line + '\n', null);
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

var app = require('express').createServer();

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

app.listen(3000);

getTracklist();
setInterval(getTracklist, 120000);

