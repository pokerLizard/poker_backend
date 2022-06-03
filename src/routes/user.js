var express = require('express');
var router = express.Router();

var auth = require('../middlewares/auth')

router.post('/profile', auth, (req, res, next) => { res.json({}) })

module.exports = router;
