var request = require('request');

function getLink(artist, title, callback) {
    var uri = 'http://ws.spotify.com/search/1/track.json?q=' + escape(artist + '+' + title);
    
    request({ uri: uri, json: true }, function(error, res, result) {
            if (!error && res.statusCode == 200 && result.tracks.length > 0) {
                var link = result.tracks[0].href;
                callback(link);
            } 
            else {
                callback(null);
            }
        }
    );
}

module.exports.getLink = getLink;