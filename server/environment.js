module.exports = function(app, express) {
    
    var oneDay = 86400000; // milliseconds
    
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    //app.use(express.staticCache());
    app.use(express.static(__dirname + '/../public', { maxAge: oneDay }));
};