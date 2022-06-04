const Club = require('../models/club')
const User = require('../models/user')

exports.createClub = async (name, user) => {
    try {
        var exist = await Club.exists({ name: name })
        if (exist) throw Error("club name already used")
        else {
            var club = new Club({ name: name, users: [user._id], owner: user._id })
            club.save()
        }
    } catch (e) {
        throw e
    }
}

exports.addMember = async (clubName, user) => {
    try {
        var club = await Club.findOne({ name: clubName })
        if (!club) {
            throw Error("club not existed")
        }
        if (club.users.includes(user._id))
            throw Error("user already in club")
        else {
            club.users.push(user._id)
            club.save()
        }

    } catch (e) {
        throw e
    }
}

exports.getMembers = async (clubName) => {
    try {
        var club = await Club.findOne({ name: clubName })
        if (!club) {
            throw Error("club not existed")
        }
        var _members = club.users.map(async (_id) => {
            var user = await User.findById(_id)
            console.log(user)
            return user
        })
        var members = await Promise.all(_members)
        return members
    } catch (e) {
        throw e
    }
}