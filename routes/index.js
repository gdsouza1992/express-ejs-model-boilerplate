var express = require('express');
var axios = require('axios');
var router = express.Router();
var rp = require('request-promise');

/* GET all users listing. */
router.post('/api/getData', function(req, res, next) {
    try {
        var grid = req.body;

        var responseArray = [];

        var Promise = require("bluebird");
        var request = Promise.promisifyAll(require("request"), {multiArgs: true});

        var urlList = grid.map((gridPoint) => {
            var gridLat = gridPoint.lat.toFixed(3);
            var gridLng = gridPoint.lng.toFixed(3);
            return `https://www.broadbandmap.gov/broadbandmap/demographic/2014/coordinates?latitude=${gridLat}&longitude=${gridLng}&format=json`
        })

        console.log(urlList);

        Promise.map(urlList, function(url) {
            return request.getAsync(url).spread(function(response,body) {
                return [JSON.parse(body),url];
            });
        }).then(function(results) {
             // results is an array of all the parsed bodies in order
             responseArray = results.map((pointData) => {
                 if(typeof pointData[0].Results == 'undefined' || typeof pointData[0].Results.medianIncome == 'undefiend'){
                     return;
                 }

                var url = pointData[1];
                var snipped = url.substring(80);
                var lat = snipped.substring(0,snipped.indexOf('&'));
                var snipped2 = snipped.substr(snipped.indexOf('=')+1)
                var lng = snipped2.substr(0,snipped2.indexOf('&'))
                return ({
                	"lat": parseFloat(lat),
                	"lng": parseFloat(lng),
                    "medianIncome": pointData[0].Results.medianIncome
                })
            })
            res.json(responseArray);
        }).catch(function(err) {
             // handle error here
             console.log(err);
             res.json({
                 "error" : "Error in getting json Data"
             });
        });


    } catch (e) {
        console.log(e);
    }
});

router.get('/api/getPolygons', function(req, res, next) {
    const polygonModel = require('../models/userPolygons');
    polygonModel.getPolygons((err, results) => {
        if(err){
            console.log("Error in getting data");
            res.json("Error in getting data");
        } else {
            console.log("getPolygons success");
            res.json(results);
        }
    });

});


router.post('/api/savePolygon', function(req, res, next) {
    const polygonMapState = req.body;
    const polygonModel = require('../models/userPolygons');
    polygonModel.insertPolygon(polygonMapState, (err, result) => {
        if(err){
            console.log("Error in inserting data");
            res.json("Error in inserting data");
        } else {
            console.log("savePolygon success");
            res.json("Success in inserting data");
        }
    });
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});


module.exports = router;
