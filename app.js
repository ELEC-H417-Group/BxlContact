const WebSocket = require('ws')
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var session = require('express-session');
var logger = require('morgan');


var indexRouter = require('./routes/index');

var app = express();

app.use(session({
    secret: '@BXLBXLBXL@',
    key: 'express_chapter6',
    saveUninitialized: false,
}));

const server = app.listen(9876)
const wss = new WebSocket.Server({
    server
})

/*
add message

*/
// HashMap: {key: userId, value: [ws, userName]}
const usersId = new Map()

wss.on('connection', function connection(ws) {
    console.log('ws is connected')
    var userId = genereteUserId()
    ws.on('message', function message(msg) {
        wss.clients.forEach(function each(client) {
            console.log('clients: ' + client)
            if (client == ws && client.readyState === WebSocket.OPEN) {
                var data = JSON.parse(msg)
                check(client, data, userId)
            }
        })
    })
})

function genereteUserId() {
    //Math.floor(Math.random() * 100)
    var userId = Date.now() % 1000
    while (usersId.has(userId)) {
        userId = Date.now() % 1000
    }
    return userId
}

function check(client, data, userId) {
    switch (data.type) {
        case 'users':
            usersId.set(userId, [client, data.userName])
            var dataNewUser = {
                type: 'users',
                userId: userId,
                users: JSON.stringify(usersId, replacer)
            }
            client.send(JSON.stringify(dataNewUser))
            broadcast(userId, data.userName)
            break
        case 'message':
            var ws = usersId.get(data.userId)
            if (ws[0] == undefined) {
                console.log('userid undefined')
            } else {
                ws[0].send(JSON.stringify(data))
            }
            break
        default:
            console.log(`Wrong expression`)
    }
}

//map to object
function replacer(key, value) {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()), // or with spread: value: [...value]
        };
    } else {
        return value;
    }
}

/*
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
}*/

/*BroadCast the new user to all users*/
function broadcast(userId, userName) {
    for (const [key, value] of usersId.entries()) {
        if (key != userId) {
            data = {
                type: 'newUser',
                userName: userName,
                userId: userId
            }
            console.log(data)
            value[0].send(JSON.stringify(data))
        }
    }
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// make session a global var
app.use(function(req, res, next) {
    res.locals = req.session;
    next();
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