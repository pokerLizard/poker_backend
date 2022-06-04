// 載入 server 程式需要的相關套件
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var morgan = require('morgan')
var mongoose = require('mongoose')
var config = require('./config')

var port = process.env.PORT || 8080
mongoose.connect(config.database)
app.set('secret', config.secret)

// 套用 middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(morgan('dev'))

const auth = require('./src/routes/auth')
const user = require('./src/routes/user')
const game = require('./src/routes/game')
const club = require('./src/routes/club')
app.use('/auth', auth);
app.use('/user', user);
app.use('/game', game);
app.use('/club', club);


app.listen(port, function () {
    console.log('The server is running at http://localhost:' + port)
})
