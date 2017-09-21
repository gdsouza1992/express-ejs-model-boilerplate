var Sequelize = require('sequelize');
var config    = require('../config/config').db;

// initialize database connection
var sequelize = new Sequelize(
    config.name,
    config.user,
    config.password,
    config.options
);

// load models
var models = [
    'user'
];

models.forEach(function(model) {
    module.exports[model] = sequelize.import(__dirname + '/' + model);
});


// export connection
module.exports.sequelize = sequelize;
