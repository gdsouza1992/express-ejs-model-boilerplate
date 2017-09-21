var express = require('express');
var router = express.Router();

var models = require('../models'),
    User = models.user;

/* GET all users listing. */
router.get('/', function(req, res, next) {
  User.findAll().then(function (users) {
        res.json(users);
    }).catch(function (err) {
        next();
    });
});

/* GET user by id */
router.get('/:id', function(req, res, next) {
  const userID = req.params.id;
  User.find(
      {
          where: {id: userID}
      }
  ).then(function (user) {
        res.json(user);
    }).catch(function (err) {
        next();
    });
});

router.get('/search/:term', function(req, res, next) {
  const term = req.params.term;
  User.findAll(
      {
          where: {
              username : {
                  $like: '%'+term+'%'
              }
          }
      }
  ).then(function (users) {
        res.json(users);
    }).catch(function (err) {
        next();
    });
});

module.exports = router;
