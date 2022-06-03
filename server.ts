// 載入 server 程式需要的相關套件
import express, {Express, Request, Response, NextFunction} from 'express';

const app: Express = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');

// 載入 jwt 函式庫協助處理建立/驗證 token
const jwt = require('jsonwebtoken');
// 載入設定
const config = require('./config');
// 載入資料模型
const User = require('./app/models/user');

const port = process.env.PORT || 8080;
mongoose.connect(config.database);
app.set('secret', config.secret);

// 套用 middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(morgan('dev'));

app.get('/setup', (req: Request, res: Response) => {
  const andyyou = new User({
    name: 'andyyou',
    password: '12345678',
    admin: true,
  });
  andyyou.save((err: Error) => {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({success: true});
  });
});

const api = express.Router();

app.use('/api', api);
api.get('/', (req: Request, res: Response) => {
  res.json({message: 'Welcome to the APIs'});
});

api.get('/users', (req: Request, res: Response) => {
  User.find({}, (err: Error, users: JSON) => {
    res.json(users);
  });
});

app.listen(port, () => {
  console.log('The server is running at http://localhost:' + port);
});
