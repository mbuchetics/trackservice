m = function() {
    var key = this.artist + ' - ' + this.title;
    var value = {
        artist: this.artist,
        title: this.title,
        count: 1,
        times: [ this. time ]
    };
    emit(key, value);
};

r = function(key, arr_values) {
    var result = { 
        artist: arr_values[0].artist,
        title: arr_values[0].title,
        count: 0,
        times: [ ] 
    };
    
    arr_values.forEach(function(value) {
        result.count += value.count;
        result.times = result.times.concat(value.times);
    });
    
    return result;  
};

f = function(key, value) {
    return value;
};

db.songs.mapReduce(m, r, { finalize: f, out: "tmp" });