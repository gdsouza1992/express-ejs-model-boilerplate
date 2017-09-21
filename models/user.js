module.exports = function(sequelize, DataTypes) {
    return sequelize.define('user', {
        email: DataTypes.STRING,
        email_verified: DataTypes.BOOLEAN,
        username: DataTypes.STRING,
        password: DataTypes.STRING,
        avatar_url: DataTypes.STRING,
        deleted: DataTypes.BOOLEAN
    }, {
        instanceMethods: {
            countTasks: function() {
                // how to implement this method ?
            }
        }
    });
};
