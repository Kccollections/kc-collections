var express = require('express');
var router = express.Router();

// Import routes
const userRoutes = require('../models/User.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


module.exports = router;