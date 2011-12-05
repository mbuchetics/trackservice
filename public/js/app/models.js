define([
    "app/models/user",
    "app/models/song",
    "app/models/play",
], function(user, models_song, models_play) { 
    return { 
        User: user,
        Song: models_song.Song,
        Songs: models_song.Songs,
        Play: models_play.Play,
        Plays: models_play.Plays
    }; 
});
