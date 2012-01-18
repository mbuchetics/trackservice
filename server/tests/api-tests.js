var vows = require('vows'),
    assert = require('assert'),
    request = require('request'),
    server = require('../server');

var api = {
    get: function(path) {
        return function() {
            request({ 
                url: 'http://localhost:3000/api/' + path, 
                json: true 
            }, this.callback);
        }
    }
};

function assertStatus(code) {
    return function(err, res) {
        assert.equal(res.statusCode, code);
    }
}

function assertJson() {
    return function(err, res, body) {
        assert.equal(res.statusCode, 200);
        assert.isArray(body);
    }
}
    
vows.describe('api-tests').addBatch({
    'when server is listening on 3000': {
        topic: function() {
            server.run(this.callback);
        },
        'and requesting /api/*': {
            topic: api.get('*'),
            'status code should be 404': assertStatus(404),
        },
        'and requesting /api/plays': {
            topic: api.get('plays'),
            'should return return json array of songs': assertJson()
        }
    }
}).export(module);
