exports.createGame = (req, res, next) => {
    var decoded = req.decoded;
    console.log(decoded)
    res.send(`create game by ${decoded.user.name}`)
};