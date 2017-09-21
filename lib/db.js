var db = {},
    mysql = require('mysql')

db.connect = function () {
    var connection = mysql.createConnection(config.db);

    connection.connect(function (err) {
        if (err) {
            logger.error('DB connection error: ' + err);
        }
    });

    connection.on('close', function (err) {
        logger.error('mysqldb conn close');
    });

    connection.on('error', function (err) {
        logger.error('mysqldb error: ' + err);
    });

    return connection;
};

module.exports = db;
