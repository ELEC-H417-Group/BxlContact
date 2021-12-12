const WebSocket = require('ws')
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

var app = express();

const server = app.listen(9876)
const wss = new WebSocket.Server({
    server
})

// HashMap: {key: userId, value: [ws, userName]}
const usersId = new Map()

wss.on('connection', function connection(ws) {
  var userId = genereteUserId()

  ws.on('message', function message(msg) {
    wss.clients.forEach(function each(client) {
      if (client == ws && client.readyState === WebSocket.OPEN) {
        var data = JSON.parse(msg)
        check(client, data, userId) 
      }
    })
  })
})

function genereteUserId(){
  //Math.floor(Math.random() * 100)
  var userId = Date.now() % 1000
  while (usersId.has(userId)){
    userId = Date.now() % 1000
  }
  return userId
}

function check(client, data, userId){
  switch (data.type){
    case 'users':
      var data = {
        type: 'users',
        userId:userId,
        users: usersId

      }
      client.send(JSON.stringify(data))
      break
    case 'message':
      var ws = usersId.get(data.userId)
      if (ws == undefined){
        console.log('userid undefined')
      }
      else{
        ws.send(JSON.stringify(data))
      }
      break
  
    default:
      console.log(`Wrong expression`)
  }
}


function checkCredential(userName, password, userId){
  cred = {
    type: 'signin',
    resp: 'false',
    userId: userId,
    userName: userName
  }
  
  if (userName == "" && password == ""){
      cred.resp = 'true'
  }
  return cred
}

function broadcast(userId, userName){
  usersId.forEach((key, value) => {
    if(key != userId){
        data = {
          type :'newUser',
          userName: userName,
          userId:userId
        }
        value[0].send(JSON.stringify())
    }
  })
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;