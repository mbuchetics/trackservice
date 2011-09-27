m = function() {
	emit( this.artist, {count: 1, times: [ this.time ]} );
}

r = function(key, arr_values) {
	var result = { count: 0, times: [] };
	
	arr_values.forEach(function(value) {
	    result.count += value.count;
	    result.times = result.times.concat(value.times);
	});
	
	return result;	
}

f = function(key, value) {
    return value.count;
}

db.songs.mapReduce(m, r, { finalize: f, out: "topartists" });
var top15 = db.topartists.find().sort({"value" : -1 }).limit(15);