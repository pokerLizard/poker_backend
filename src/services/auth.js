var User = require('../models/user')
var config = require('../../config')
var jwt = require('jsonwebtoken')

exports.findUser = (name, res) => {
  User.findOne({ name: name }, (err, user) => {
    if (err) throw err
    if (!user) {
      throw Error("can't find user")
    } else if (user) {
      token = jwt.sign({ user }, config.secret, {
        expiresIn: 60 * 60 * 24
      })
      res.json({ token: token })
    }
  })
}
