module.exports = function(app, express) {
    //app.use(express.staticCache());
    app.use(express.static(__dirname + '/public'));
};