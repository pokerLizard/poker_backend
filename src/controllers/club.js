const clubServices = require('../services/club')

exports.createClub = async (req, res, next) => {
    try {
        const decoded = req.decoded;
        const user = decoded.user
        await clubServices.createClub(req.body.name, user)
        res.json({ success: true })
    } catch (e) {
        res.status(403).json({ error: e.message })
    }
}

exports.addMember = async (req, res, next) => {
    const decoded = req.decoded;
    const user = decoded.user
    try {
        await clubServices.addMember(req.body.clubName, user)
        res.json({ success: true })
    } catch (e) {
        res.status(403).json({ error: e.message })
    }
}

exports.getMembers = async (req, res, next) => {
    try {
        var members = await clubServices.getMembers(req.body.clubName)
        res.json({ members: members })
    } catch (e) {
        res.status(403).json({ error: e.message })
    }
}