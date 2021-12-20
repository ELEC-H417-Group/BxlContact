var mysql = require('mysql');
var wss = require('../app')
const crypto = require('crypto');

const pwdKey = 'Password!'

function aesEncrypt(data, key) {
    const cipher = crypto.createCipher('aes192', key);
    var crypted = cipher.update(data, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

function aesDecrypt(encrypted, key) {
    const decipher = crypto.createDecipher('aes192', key);
    var decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
var pool = mysql.createPool({
    host: '47.93.96.71',
    user: 'BxlContact',
    password: '123456',
    database: 'bxlcontact'
});

String.prototype.hashCode = function() {
    if (Array.prototype.reduce) {
        return this.split("").reduce(function(a, b) {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a
        }, 0);
    }
    var hash = 0;
    if (this.length === 0) return hash;
    for (var i = 0; i < this.length; i++) {
        var character = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + character;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

exports.showSign = function(req, res) {
    res.render('user/sign');
}

exports.doSign = function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    pool.getConnection((err, connection) => {
        getName(connection, (result) => {
            for (var i = 0; i < result.length; i++) {
                if (result[i].username == username) {
                    res.render('user/successSign', { text: 'The username has been used, you can try another!' })
                    return
                }
            }
            pool.getConnection((err, connection) => {
                insertName(connection, username, password, () => {
                    res.render('user/successSign', { text: 'You have successfuly signed in!' })
                })
            })
        })
    });

}

exports.showLogin = function(req, res) {
    if (req.session.username) {
        var username = req.session.username
        res.render('user/chatroom', {
            username: username
        })
    }
    var challengeCode = getVerCode()
    req.session.challengeCode = challengeCode
    res.render('index', { tips: 'Please Log in !', challengeCode: challengeCode })
}

exports.doLog = function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    // check data in database
    pool.getConnection((err, connection) => {
        getName(connection, (result) => {
            for (var i = 0; i < result.length; i++) {
                if (result[i].username == username) {
                    var Decrypt = aesDecrypt(result[i].password, pwdKey)
                    console.log('期望的： ' + Decrypt)
                    var expectedPassword = (Decrypt + req.session.challengeCode).hashCode()
                    if (expectedPassword == password) {
                        if (!req.session.username) {
                            req.session.username = username;
                        }
                        res.render('user/chatroom', { username: username })
                        return
                    } else {
                        var challengeCode = getVerCode()
                        req.session.challengeCode = challengeCode
                        res.render('index', { tips: 'Wrong Password !', challengeCode: challengeCode })
                        return
                    }
                }
            }
            var challengeCode = getVerCode()
            req.session.challengeCode = challengeCode
            res.render('index', { tips: 'Wrong Username !', challengeCode: challengeCode })
        })
    })
}


exports.Logout = function(req, res) {
    var username = req.session.username
    req.session.destroy();
    wss.logoutUser(username)
    res.redirect('/')
}

var getName = (connection, callback) => {
    var getNameSql = 'SELECT * FROM `user`';
    connection.query(getNameSql, function(err, result) {
        if (err) {
            console.log('[SELECT ERROR] - ', err.message);
            return;
        }
        connection.release()
        callback(result)
    });
}

var insertName = (connection, username, password, callback) => {
    var addSql = 'INSERT INTO user(username,password) VALUES(?,?)';
    var processedPwd = aesEncrypt(password, pwdKey)
    var addSqlParams = [username, processedPwd];
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

const getVerCode = () => {
    let verCode = Math.floor((Math.random() * 1000000) + 1);
    if (verCode < 100000) {
        return getVerCode();
    }
    return verCode;
}