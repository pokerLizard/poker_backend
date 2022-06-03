var express = require('express');
var router = express.Router();

var gameController = require('../controllers/game')
var auth = require('../middlewares/auth')

router.post('/createGame', auth, gameController.createGame)

module.exports = router;
