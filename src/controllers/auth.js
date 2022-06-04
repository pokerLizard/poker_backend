var authServices = require('../services/auth')
exports.authenticate = (req, res, next) => {
    try {
        authServices.findUser(req.body.name).then((user) => {
            const token = authServices.getToken(user);
            res.json({ token: token })
        }, (err) => {
            throw err
        })
    }
    catch (e) {
        console.log(e)
        res.json({ error: e.message })
    }
}
