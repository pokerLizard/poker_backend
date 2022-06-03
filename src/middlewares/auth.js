var jwt = require('jsonwebtoken')
var config = require('../../config')

module.exports = (req, res, next) => {
    var token = req.body.token || req.query.token || req.headers['x-access-token']
    console.log(123)
    if (token) {
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' })
            } else {
                req.decoded = decoded
                next()
            }
        })
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        })
    }
}