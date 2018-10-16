var express = require('express');
const config = require('../config')
var router = express.Router();
router.get('/', function(req, res, next) {
  res.json(config);
});

module.exports = router;
