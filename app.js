const WebSocket = require('ws')
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var session = require('express-session');
var logger = require('morgan');

let crypto;

crypto = require('crypto');



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


// HashMap: {key:  userName, value: ws}
const usersName = new Map()

// preKeyBundle of each user
const preKeyBundles = new Map()

wss.on('connection', function connection(ws) {
    ws.on('message', function message(msg) {
        wss.clients.forEach(function each(client) {
            if (client == ws && client.readyState === WebSocket.OPEN) {
                var data = JSON.parse(msg)
                check(client, data)
            }
        })
    })
})



function check(client, data) {
    switch (data.type) {
        case 'users':
            sendAllUsers(client, data)
            break
        case 'message':
            sendMessageTo(data)
            break
        default:
            console.log(`Wrong expression`)
    }
}

//Send to all users wich user is connected.
function sendAllUsers(client, data) {
    usersName.set(data.userName, client)
    preKeyBundles.set(data.userName, data.preKeyBundle)
    var dataNewUser = {
        type: 'users',
        userName: data.userName,
        users: JSON.stringify(usersName, replacer),
        preKeys: JSON.stringify(preKeyBundles, replacer)
    }
    client.send(JSON.stringify(dataNewUser))
    broadcast(data.userName)
}

//send a message to a specific user
function sendMessageTo(data) {
    var ws = usersName.get(data.receiverId)
    if (ws == undefined) {
        console.log('userName undefined')
    } else {
        msg = {
            type: 'message',
            userName: data.senderid,
            message: data.message
        }
        ws.send(JSON.stringify(msg))
    }
}

//Map to object
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


//BroadCast the new user to all user
function broadcast(userName) {
    for (const [key, value] of usersName.entries()) {
        if (key != userName) {
            data = {
                type: 'newUser',
                userName: userName
            }
            value.send(JSON.stringify(data))
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