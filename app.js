var WebSocket = require('ws')
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var session = require('express-session');
var logger = require('morgan');
var crypto = require("crypto");
var indexRouter = require('./routes/index');

// for secret encryption: DH algorithm
// the prime will be share to everyone                                              
var serverKey = crypto.createDiffieHellman(512);
var prime = serverKey.getPrime();
var generator = serverKey.getGenerator()

// Page changes are hosted by express
var app = express();
// Use session to keep the user logged in
app.use(session({
    secret: '@BXLBXLBXL@',
    key: 'express_chapter6',
    saveUninitialized: false,
}));

const server = app.listen(9876) // could be changed to your port
const wss = new WebSocket.Server({
    server
})


// HashMap: {key:  userName, value: ws}
const usersName = new Map()

// HashMap: {key: userName, value: pubKey}
const usersPubKey = new Map()

// connect to mysql server
var mysql = require('mysql');
var pool = mysql.createPool({
    host: '47.93.96.71', // Can be changed to your own server
    user: 'BxlContact',
    password: '123456',
    database: 'bxlcontact'
});
// the websocket server
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
        case 'users': // send online user message to all client
            sendAllUsers(client, data)
            break
        case 'pubKey': // send  user public key to all client
            broadcastNewPubKey(data)
            break
        case 'message': // handler for message passing
            sendMessageTo(data)
            break
        case 'encryptedMessage': // handler for encrypted message passing (secret mode)
            sendEncryptMsg(data)
            break
        case 'getHistory': // send history message to client
            sendHisResponse(data)
            break
        default:
            console.log(`Wrong expression`)
    }
}

const sendHisResponse = (data) => {
    pool.getConnection((err, connection) => {
        getHis(connection, data.from, data.to, (result) => {
            var sortedResult = result.sort((a, b) => a.time > b.time ? 1 : -1)
            var client = usersName.get(data.from)
            var dataHis = {
                type: 'getHistory',
                content: sortedResult,
                to: data.to
            }
            client.send(JSON.stringify(dataHis))
        })
    })
}

// get history message from mysql db
var getHis = (connection, from, to, callback) => {
    var getHisSql = 'SELECT * FROM `content` WHERE (`from` = ? AND `to` = ?) OR (`from` = ? AND `to` = ?)';
    var params = [from, to, to, from]
    connection.query(getHisSql, params, function(err, result) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        console.log(result)
        connection.release()
        callback(result)
    });
}

//Send to all users wich user is connected.
function sendAllUsers(client, data) {
    usersName.set(data.userName, client)
    var dataNewUser = {
        type: 'users',
        userName: data.userName,
        prime: prime,
        generator: generator,
        usersPubKey: JSON.stringify(usersPubKey, replacer),
        users: JSON.stringify(usersName, replacer)
    }
    client.send(JSON.stringify(dataNewUser))
    broadcast(data.userName)
}

// handler for sending encrypted message
function sendEncryptMsg(data) {
    var ws = usersName.get(data.sendToUser)
    if (ws == undefined) {
        console.log('userName undefined')
    } else {
        msg = {
            type: 'encryptedMessage',
            userName: data.from,
            message: data.message
        }
        ws.send(JSON.stringify(msg))
    }
}

// broadcast the new public key to all users
function broadcastNewPubKey(data) {
    usersPubKey.set(data.userName, data.clientKey)
    console.log('USERS PUBLIC KEY')
    console.log(usersPubKey)
    console.log('PUB KEY DAT')
    console.log(data)
    for (const [key, value] of usersName.entries()) {
        if (key != data.userName) {
            msg = {
                type: 'newPubKey',
                userName: data.userName,
                pubKey: data.clientKey
            }
            value.send(JSON.stringify(msg))
        }
    }
}

// exports the logout procedure for user controller
exports.logoutUser = (username) => {
    usersName.delete(username)
    usersPubKey.delete(username)
    for (const [key, value] of usersName.entries()) {
        data = {
            type: 'logout',
            username: username
        }
        value.send(JSON.stringify(data))
    }
    return
}

//send a message to a specific user
function sendMessageTo(data) {
    pool.getConnection((err, connection) => {
        insertChat(connection, data.from, data.sendToUser, data.message, () => {
            var ws = usersName.get(data.sendToUser)
            if (ws == undefined) {
                console.log('userName undefined')
            } else {
                msg = {
                    type: 'message',
                    userName: data.from,
                    message: data.message
                }
                ws.send(JSON.stringify(msg))
            }
        })
    })

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

// for insert chat content to mysql db
var insertChat = (connection, from, to, content, callback) => {
    var addSql = 'INSERT INTO `content`(`from`,`to`,`content`,`time`) VALUES(?,?,?,?)';
    var time = new Date();
    var addSqlParams = [from, to, content, time];
    connection.query(addSql, addSqlParams, function(err, result) {
        if (err) {
            console.log('[INSERT ERROR] - ', err.message);
            return;
        }
        console.log('--------------------------INSERT----------------------------');
        //console.log('INSERT ID:',result.insertId);        
        console.log('INSERT ID:', result);
        console.log('-----------------------------------------------------------------\n\n');
        connection.release();
        callback()
    });
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