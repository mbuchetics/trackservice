module.exports = function(app, express) {
    
    var oneDay = 8640000000; // milliseconds
    
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.staticCache());
    app.use(express.static(__dirname + '/../public', { maxAge: oneDay }));
};