var mongoose = require('mongoose')
var Schema = mongoose.Schema
var User = require('./user')

module.exports = mongoose.model('Club', new Schema({
    name: String,
    users: [{ type: Schema.Types.ObjectId, ref: 'User' },],
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
}))
