var mongodb = require('mongodb'),
    colors = require('colors'),
    util = require('util'),
    _ = require('underscore'),
    spotify = require('./spotify'),
    db;
    
function init(config, callback, errorCallback) {
    console.log('trying to connect to db');
    console.log(config);

    mongodb.connect(config.db_url, {
        server: {
            auto_reconnect: true
        }
    }, function(err, database) {
        if (!err) {
            db = database;
            callback();
        }
        else {
            console.log('error connecting to db'.red);
            if (errorCallback) {
                errorCallback();   
            }
        }
    });
}

function getCollection(name, callback, errorCallback) {
    db.collection(name, function(err, collection) {
        if (!err) {
            callback(collection);
        }
        else {
            console.log("getCollection failed");
            if (errorCallback) {
                errorCallback();   
            }
        }
    });
}

function dropCollection(collectionName) {
	getCollection(collectionName, function(collection) { 
		collection.drop(); 
	}, errorCallback);
}

function getItems(collectionName, filterCriteria, sortCriteria, count, callback, errorCallback) {
    if (count < 0) {
        count = 0;
    }
    
    getCollection(collectionName, function(collection) {
        collection.find(filterCriteria).sort(sortCriteria).limit(count).toArray(function(err, results) {
            if (!err) {
                callback(results);
            }
            else {
                console.log("getItems failed");
                if (errorCallback) {
                    errorCallback();   
                }
            }
        }, errorCallback);
    });
}

function getItem(collectionName, criteria, callback, errorCallback) {
    getCollection(collectionName, function(collection) {
        collection.findOne(criteria, function(err, result) {
            if (!err) {
                callback(result);
            }
            else {
                console.log("getItem failed");
                if (errorCallback) {
                    errorCallback();
                }
            }
        });
    }, errorCallback);
}

function aggregateByCount(collectionName, filterCriteria, count, map, callback, errorCallback) {
    getCollection(collectionName, function(collection) {
        var tempCollectionName = _.uniqueId('temp_');
        console.log(tempCollectionName);
        collection.mapReduce(
        map, function(key, array) {
            var result = {
                count: 0,
                times: []
            };
            array.forEach(function(value) {
                result.count += value.count;
                result.times = result.times.concat(value.times);
            });
            return result;
        }, {
            out: tempCollectionName,
            query: filterCriteria
        }, function(err, collection) {
            if (!err) {
                collection.find().sort({
                    'value.count': -1
                }).limit(count).toArray(function(err, results) {
                    if (!err) {
                        callback(results);
                        dropCollection(tempCollectionName);
                    }
                });
            }
            else {
                console.log("aggregateByCount failed");
                if (errorCallback) {
                    errorCallback();
                }
            }
        });
    }, errorCallback);
}

function getTopPlayedArtists(filterCriteria, count, callback, errorCallback) {
    aggregateByCount('plays', filterCriteria, count, function() {
        emit(this.artist, {
            count: 1,
            times: [this.time]
        });
    }, function(results) {
        var mappedResults = _.map(results, function(item) {
            return {
                artist: item._id,
                count: item.value.count
            };
        });
        callback(mappedResults);
    }, errorCallback);
}
function getTopSongs(collectionName, filterCriteria, count, callback, errorCallback) {
    aggregateByCount(collectionName, filterCriteria, count, function() {
        emit(this.song_id, {
            count: 1,
            times: [this.time]
        });
    }, function(results) {
        var songIds = _.map(results, function(item) {
            return item._id
        }),
            counts = _.map(results, function(item) {
                return item.value.count
            }),
            songsWithCounts = [];
        getSongs({
            _id: {
                $in: songIds
            }
        }, {}, count, function(songs) {
            _.each(songs, function(song, index) {
                var doc = {
                    _id: song._id,
                    artist: song.artist,
                    title: song.title,
                    count: counts[index]
                };
                if (song.spotify) {
                    doc.spotify = song.spotify;
                }
                songsWithCounts.push(doc);
            });
            callback(songsWithCounts);
        });
    }, errorCallback);
}

function getTopPlayedSongs(filterCriteria, count, callback, errorCallback) {
	getTopSongs('plays', filterCriteria, count, callback, errorCallback);
}

function getTopLikedSongs(filterCriteria, count, callback, errorCallback) {
	getTopSongs('likes', filterCriteria, count, callback, errorCallback);
}

function getLikesExt(filterCriteria, sortCriteria, count, callback, errorCallback) {
    getLikes(filterCriteria, sortCriteria, count, function(likes) {
        var songIds = _.map(likes, function(item) {
            return item.song_id
        }),
            likesExt = new Array(likes.length),
            dict = {};
        _.each(likes, function(like, index) {
            dict[like.song_id] = {
                index: index,
                like: like
            };
        });
        getSongs({
            _id: {
                $in: songIds
            }
        }, {}, count, function(songs) {
            _.each(songs, function(song, index) {
                var like = dict[song._id].like,
                    doc = {
                        _id: song._id,
                        artist: song.artist,
                        title: song.title,
                        user: like.user,
                        time: like.time
                    };
                if (song.spotify) {
                    doc.spotify = song.spotify;
                }
                likesExt[dict[song._id].index] = doc;
            });
            callback(likesExt);
        });
    }, errorCallback);
}

// convenience

function toObjectID(idString) {
    return new db.bson_serializer.ObjectID(idString);
}

function getSongsCollection(callback, errorCallback) {
    getCollection('songs', callback, errorCallback);
}

function getPlaysCollection(callback, errorCallback) {
    getCollection('plays', callback, errorCallback);
}

function getLikesCollection(callback, errorCallback) {
    getCollection('likes', callback, errorCallback);
}

function getUsersCollection(callback, errorCallback) {
    getCollection('users', callback, errorCallback);
}

function getSongs(filterCriteria, sortCriteria, count, callback, errorCallback) {
    getItems('songs', filterCriteria, sortCriteria, count, callback, errorCallback);
}

function getPlays(filterCriteria, sortCriteria, count, callback, errorCallback) {
    getItems('plays', filterCriteria, sortCriteria, count, callback, errorCallback);
}

function getLikes(filterCriteria, sortCriteria, count, callback, errorCallback) {
    getItems('likes', filterCriteria, sortCriteria, count, callback, errorCallback);
}

function getUsers(filterCriteria, sortCriteria, count, callback, errorCallback) {
    getItems('users', filterCriteria, sortCriteria, count, callback, errorCallback);
}

function getSong(criteria, callback, errorCallback) {
    getItem('songs', criteria, callback, errorCallback);
}

function getPlay(criteria, callback, errorCallback) {
    getItem('plays', criteria, callback, errorCallback);
}

function getLike(criteria, callback, errorCallback) {
    getItem('likes', criteria, callback, errorCallback);
}

function getUser(criteria, callback, errorCallback) {
    getItem('users', criteria, callback, errorCallback);
}

// high level

function insertPlay(songId, song, spotifyLink) {
    var playDoc = {
        song_id: songId,
        time: song.time,
        artist: song.artist,
        title: song.title,
        source: song.source
    };
    
    if (spotifyLink) {
        playDoc.spotify = spotifyLink;
    }
    
    getPlaysCollection(function(collection) {
        collection.insert(playDoc);
        collection.ensureIndex({ time: -1 }, function() {});
        collection.ensureIndex({ song_id: 1 }, function() {});
    });
}

function insertPlayAndUpdateSong(songId, song, spotifyLink) {
    var toSet = {},
        toUnset = {};
        
    // insert the play
    insertPlay(songId, song, spotifyLink);
    
    // update song
    
    toSet.last_time = song.time;
    
    if (spotifyLink) {
        toSet.spotify = spotifyLink;
    }
    else {
        toUnset.spotify = 1;
    }

    getSongsCollection(function(collection) { 
        collection.update({ artist: song.artist, title: song.title }, {
            $inc: { play_count: 1 },
            $set: toSet,
            $unset: toUnset
        });
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
            
            spotify.getLink(song.artist, song.title, function(link) {
               if (link !== null) {
                   songDoc.spotify = link;
               }
               
               // insert the song            
               getSongsCollection(function(collection) {
                   collection.insert(songDoc);
                   collection.ensureIndex({ artist: 1 }, function() {});
                   collection.ensureIndex({ title: 1 }, function() {});

                   // then insert the play
                   insertPlay(songDoc._id, song, link);

                   console.log('NEW SONG:'.underline.red);
                   console.log(util.inspect(songDoc).red);
               });
            });
        }
        else {
            // song in database, check the play
            getPlay({ artist: song.artist, title: song.title, time: song.time }, function(foundPlay) {
                // play not in database
                if (!foundPlay) {
                    
                    if (!foundSong.spotify) {
                        spotify.getLink(song.artist, song.title, function(link) {
                           insertPlayAndUpdateSong(foundSong._id, song, link);
                        });
                    }
                    else {
                        insertPlayAndUpdateSong(foundSong._id, song, foundSong.spotify);
                    }
                    
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
            var now = new Date(),
                likeDoc = {
                   song_id: songId,
                   user: user,
                   time: now
                };
            
            // insert the like
            getLikesCollection(function(collection) {
                collection.update({ song_id: songId, user: user }, likeDoc, { upsert: true });
                
                console.log({ song_id: songId, user: user });
                console.log(likeDoc);
                
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
            
            // update the users
            getUsersCollection(function(collection) {
                collection.update({ user: user }, { user: user, last_like: likeDoc }, { upsert: true });
                collection.ensureIndex({ user: 1 }, function() {});
            });
            
            console.log('LIKE: %s - %s (%s)'.underline.green, foundSong.artist, foundSong.title, user);
        }
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
module.exports.getUsersCollection = getUsersCollection;
module.exports.getSongs = getSongs;
module.exports.getPlays = getPlays;
module.exports.getUsers = getUsers;
module.exports.getLikes = getLikes;
module.exports.getLikesExt = getLikesExt;
module.exports.getSong = getSong;
module.exports.getPlay = getPlay;
module.exports.getLike = getLike;
module.exports.getUser = getUser;
module.exports.addPlay = addPlay;
module.exports.addLike = addLike;

module.exports.getTopPlayedArtists = getTopPlayedArtists;
module.exports.getTopPlayedSongs = getTopPlayedSongs;
module.exports.getTopLikedSongs = getTopLikedSongs;
