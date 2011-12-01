var config = {};

config.port = process.env.PORT || 3000;
config.db_url = process.env.MONGODB_URL || 'mongodb://localhost:27017/music';
config.server = process.env.SERVER || 'local';

module.exports = config;
