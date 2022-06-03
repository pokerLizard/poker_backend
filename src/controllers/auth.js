var authServices = require('../services/auth')
exports.authenticate = (req, res, next) => {
    try {
        authServices.findUser(req.body.name, res)
    }
    catch (e) {
        console.log(e)
        res.json({ error: e.message })
    }
}
