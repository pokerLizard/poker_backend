var express = require('express');
var router = express.Router();
const clubController = require('../controllers/club')

router.post('/createClub', clubController.createClub)

module.exports = router;
