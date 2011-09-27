var mongodb = require('mongodb'),
    colors = require('colors'),
    util = require('util'),
    db;
    
function init(config, callback) {
    console.log('trying to connect to db');
    console.log(config);

    mongodb.connect(config.db_url, function(err, database) {
        if (!err) {
            db = database;
            callback();
        }
        else {
            console.log('error connecting to db'.red);
        }
    });
}

function getCollection(name, callback) {
    db.collection(name, function(err, collection) {
        if (!err) {
           callback(collection);
        }
    });
}

function getItems(collectionName, filterCriteria, sortCriteria, count, callback) {
    if (count < 0) {
        count = 0;
    }
    
    getCollection(collectionName, function(collection) {
        collection.find(filterCriteria).sort(sortCriteria).limit(count).toArray(function(err, results) {
           if (!err) {
               callback(results);
           } 
        });
    });
}

function getItem(collectionName, criteria, callback) {
    getCollection(collectionName, function(collection) {
        collection.findOne(criteria, function(err, result) {
            if (!err) {
                callback(result);
            }
        }); 
    });
}

// convenience

function toObjectID(idString) {
    return new db.bson_serializer.ObjectID(idString);
}

function getSongsCollection(callback) {
    getCollection('songs2', callback);
}

function getPlaysCollection(callback) {
    getCollection('plays', callback);
}

function getLikesCollection(callback) {
    getCollection('likes', callback);
}

function getSongs(filterCriteria, sortCriteria, count, callback) {
    getItems('songs2', filterCriteria, sortCriteria, count, callback);
}

function getPlays(filterCriteria, sortCriteria, count, callback) {
    getItems('plays', filterCriteria, sortCriteria, count, callback);
}

function getLikes(filterCriteria, sortCriteria, count, callback) {
    getItems('likes', filterCriteria, sortCriteria, count, callback);
}

function getSong(criteria, callback) {
    getItem('songs2', criteria, callback);
}

function getPlay(criteria, callback) {
    getItem('plays', criteria, callback);
}

function getLike(criteria, callback) {
    getItem('likes', criteria, callback);
}

// high level

function insertPlay(songId, song) {
    var playDoc = {
        song_id: songId,
        time: song.time,
        artist: song.artist,
        title: song.title,
        source: song.source,
    };
    
    getPlaysCollection(function(collection) {
        collection.insert(playDoc);
        collection.ensureIndex({ time: -1 }, function() {});
        collection.ensureIndex({ song_id: 1 }, function() {});
    });
}

function addPlay(song) {
    getSong({ artist: song.artist, title: song.title }, function(foundSong) {
        // song not in database
        if (!foundSong) {
            var songDoc = {
                artist: song.artist,
                title: song.title,
                like_count: 0,
                play_count: 1,
                last_time: song.time
            };
            
            // insert the song            
            getSongsCollection(function(collection) {
                collection.insert(songDoc);
                collection.ensureIndex({ artist: 1 }, function() {});
                collection.ensureIndex({ title: 1 }, function() {});
                
                // then insert the play
                insertPlay(songDoc._id, song);

                console.log('NEW SONG:'.underline.red);
                console.log(util.inspect(songDoc).red);
            });
        }
        else {
            // song in database, check the play
            getPlay({ artist: song.artist, title: song.title, time: song.time }, function(foundPlay) {
                // play not in database
                if (!foundPlay) {      
                    // insert the play              
                    insertPlay(foundSong._id, song);

                    // update the song with increased play count and time info
                    getSongsCollection(function(collection) { 
                        collection.update({ artist: song.artist, title: song.title }, {
                            $inc: { play_count: 1 },
                            $set: { last_time: song.time }
                        });
                    });
                    
                    console.log('PLAY: %s - %s'.underline.yellow, foundSong.artist, foundSong.title);
                }
            });
        }
    });
}

function addLike(songId, user) {
    // check if the song is in the database
    getSong({ _id: songId }, function(foundSong) {
        if (foundSong) {
            // check if the user already liked the song
            getLike({ song_id: songId, user: user }, function(foundLike) {
                if (!foundLike) {
                    var now = new Date();
                    
                    // insert the like
                    getLikesCollection(function(collection) {                        
                        var likeDoc = {
                           song_id: songId,
                           user: user,
                           time: now
                        };
                        
                        collection.insert(likeDoc);
                        
                        collection.ensureIndex({ song_id: 1 }, function() {});
                        collection.ensureIndex({ user: 1 }, function() {});
                    });
                    
                    // update the song with increased like count and time info
                    getSongsCollection(function(collection) { 
                        collection.update({ _id: songId }, {
                            $inc: { like_count: 1 },
                            $set: { last_liked: now }
                        });
                    });
                    
                    console.log('LIKE: %s - %s (%s)'.underline.green, foundSong.artist, foundSong.title, user);
                }
            });
        }
    });
}

function convertToVersion2() {
    var i = 0;
    console.log('converting ...');
    getItems('songs', { }, { time: 1 }, 0, function(songs) {
        songs.forEach(function(song) {
            console.log(i++);
            addPlay(song);
        });
    });
}

// exports

module.exports.init = init;
module.exports.getCollection = getCollection;
module.exports.getItems = getItems;
module.exports.getItem = getItem;
module.exports.toObjectID = toObjectID;
module.exports.getSongsCollection = getSongsCollection;
module.exports.getPlaysCollection = getPlaysCollection;
module.exports.getLikesCollection = getLikesCollection;
module.exports.getSongs = getSongs;
module.exports.getPlays = getPlays;
module.exports.getLikes = getLikes;
module.exports.getSong = getSong;
module.exports.getPlay = getPlay;
module.exports.getLike = getLike;
module.exports.addPlay = addPlay;
module.exports.addLike = addLike;
module.exports.convertToVersion2 = convertToVersion2;