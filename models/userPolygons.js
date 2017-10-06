var mongo = require('mongodb');
var monk = require('monk');
const db = monk('mongodb://127.0.0.1/climadb');

userPolygons = {};


userPolygons.insertPolygon = (userPolygon, callback) => {
    var collection = db.get('userPolygons');
    console.log("Inserting data");
    collection.insert(userPolygon, callback);
}

userPolygons.getPolygons = (callback) => {
    var collection = db.get('userPolygons');
    collection.find({}, callback);
}

module.exports = userPolygons;
