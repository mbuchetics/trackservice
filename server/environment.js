var config = require('./config');

module.exports = function(app, express) {
    
    var oneDay = 86400000; // milliseconds
    
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    //app.use(express.staticCache());

    if (config.node_env == 'production') {
        console.log('serving static files from /public-build');
        app.use(express.static(__dirname + '/../public-build', { maxAge: oneDay }));
    }
    else {
        console.log('serving static files from /public');
        app.use(express.static(__dirname + '/../public'));
    }
};
