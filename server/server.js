var config = require('./config'),
    db = require('./database'),
    express = require('express'),
    request = require('request'),
    http = require('http'),
    jsdom = require("jsdom"),
    util = require('util'),
    fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    colors = require('colors'),
    datetime = require('datetime'),
    jQuerySrc = fs.readFileSync('public/js/externals/jquery-1.6.3.min.js').toString();
    
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
        time = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0)),
        diffHour = 1;
        
    if (isDaylightSaving(time)) {
        diffHour = 2;
    }
             
    // fm4 trackservice times are GMT+0200
    time.setHours(time.getHours() - diffHour);
    
    if (hour < diffHour) {
    	time.setDate(time.getDate() + 1);
    }

    return time;
}

function isDaylightSaving(time) {
    return false;
}

function getTracklist() {     
    request({
       uri: 'http://hop.orf.at/img-trackservice/fm4.html',
       encoding: 'binary' 
       }, 
       function(error, res, html) {
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
            db.addPlay(newSong);
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
    
    require('./environment.js')(app, express);
    require('./routes.js')(app);
    
    console.log('listening on port ' + config.port);

    app.listen(config.port);

    getTracklist();
    printMemory();
    
    //setInterval(getTracklist, 120000);
    setInterval(getTracklist, 60000);
    setInterval(printMemory, 60000);
}

db.init(config, run);