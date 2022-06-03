var express = require('express');
var router = express.Router();

var AuthController = require('../controllers/auth')

router.post('/', AuthController.authenticate)

module.exports = router;
