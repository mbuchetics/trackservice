var config = {};

config.db_url = process.env.MONGODB_URL || 'mongodb://localhost:27017/music';

module.exports = config;