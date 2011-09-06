var config = {};

config.db = 'music';
config.host = 'staff.mongohq.com';
config.port = 10084;
config.user = process.env.MONGOHQ_USER;
config.pw = process.env.MONGOHQ_PW;

module.exports = config;