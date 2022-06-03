// 載入 server 程式需要的相關套件
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var morgan = require('morgan')
var mongoose = require('mongoose')

// 載入 jwt 函式庫協助處理建立/驗證 token
var jwt = require('jsonwebtoken')
// 載入設定
var config = require('./config')
// 載入資料模型
var User = require('./app/models/user')

var port = process.env.PORT || 8080
mongoose.connect(config.database)
app.set('secret', config.secret)

// 套用 middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(morgan('dev'))



var api = express.Router()
api.post('/authenticate', function (req, res) {
    User.findOne({
        name: req.body.name
    }, function (err, user) {
        if (err) throw err

        if (!user) {
            res.json({ success: false, message: 'Authenticate failed. User not found' })
        } else if (user) {
            if (user.password != req.body.password) {
                res.json({ success: false, message: 'Authenticate failed. Wrong password' })
            } else {
                var token = jwt.sign({ user }, app.get('secret'), {
                    expiresIn: 60 * 60 * 24
                })

                res.json({
                    success: true,
                    message: 'Enjoy your token',
                    token: token
                })
            }
        }
    })
})

api.use(function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token']
    if (token) {
        jwt.verify(token, app.get('secret'), function (err, decoded) {
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
})

api.get('/', function (req, res) {
    res.json({ message: 'Welcome to the APIs' })
})

api.get('/users', function (req, res) {
    User.find({}, function (err, users) {
        res.json(users)
    })
})
app.use('/api', api);


app.listen(port, function () {
    console.log('The server is running at http://localhost:' + port)
})