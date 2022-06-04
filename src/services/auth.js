var User = require('../models/user')
var config = require('../../config')
var jwt = require('jsonwebtoken')

exports.findUser = (name) => {
  return User.findOne({ name: name })
}

exports.getToken = (user) => {
  return jwt.sign({ user }, config.secret, {
    expiresIn: 60 * 60 * 24
  })
}