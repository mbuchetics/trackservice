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
    dateutils = require('date-utils'),
    dstTimes = null,
    jQuerySrc = fs.readFileSync('public/js/libs/externals/jquery-1.7.1.min.js').toString();
    
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
};
    
function getTime(timeStr) {
    var now = new Date(),
        hour = timeStr.substring(0,2),
        minute = timeStr.substring(3,5), 
        time = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0)),
        diffHour = 1;
        
    if (isDaylightSaving(time)) {
        diffHour = 2;
    }
             
    // fm4 trackservice times are CET (or CEST)
    time.setHours(time.getHours() - diffHour);
    
    if (hour < diffHour) {
        time.setDate(time.getDate() + 1);
    }

    return time;
}

function isDaylightSaving(time) {
    if (dstTimes === null) {
        dstTimes = new Array(
            // 2011
            new Date(Date.UTC(2011, 2, 27, 2, 0, 0)),
            new Date(Date.UTC(2011, 9, 30, 3, 0, 0)),
            // 2012
            new Date(Date.UTC(2012, 2, 25, 2, 0, 0)),
            new Date(Date.UTC(2012, 9, 28, 3, 0, 0)),
            // 2013
            new Date(Date.UTC(2013, 2, 31, 2, 0, 0)),
            new Date(Date.UTC(2013, 9, 27, 3, 0, 0)),
            // 2014
            new Date(Date.UTC(2014, 2, 30, 2, 0, 0)),
            new Date(Date.UTC(2014, 9, 26, 3, 0, 0)),
            // 2015
            new Date(Date.UTC(2015, 2, 29, 2, 0, 0)),
            new Date(Date.UTC(2015, 9, 25, 3, 0, 0)),
            // 2016
            new Date(Date.UTC(2015, 2, 27, 2, 0, 0)),
            new Date(Date.UTC(2015, 9, 30, 3, 0, 0)),
            // 2017
            new Date(Date.UTC(2015, 2, 26, 2, 0, 0)),
            new Date(Date.UTC(2015, 9, 29, 3, 0, 0)),
            // 2018
            new Date(Date.UTC(2015, 2, 25, 2, 0, 0)),
            new Date(Date.UTC(2015, 9, 28, 3, 0, 0)),
            // 2019
            new Date(Date.UTC(2015, 2, 31, 2, 0, 0)),
            new Date(Date.UTC(2015, 9, 27, 3, 0, 0))
        );
    }
    
    for (var i=0; i < dstTimes.length; i+=2) {
        var from = dstTimes[i],
            to = dstTimes[i+1];
       
        if (time.between(from, to)) {
            return true;
        }
    }    
    
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
                'source': 'fm4'
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

console.log('node version: ' + process.version);
console.log('node env: ' + config.node_env);
console.log('server: ' + config.server);
db.init(config, run);
