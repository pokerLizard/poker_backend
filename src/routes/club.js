var express = require('express');
var router = express.Router();
var auth = require('../middlewares/auth')
const clubController = require('../controllers/club')

router.post('/createClub', auth, clubController.createClub)
router.post('/addMember', auth, clubController.addMember)
router.get('/getMembers', auth, clubController.getMembers)

module.exports = router;
