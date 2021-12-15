var mysql = require('mysql');
var pool = mysql.createPool({
    host: '47.93.96.71',
    user: 'BxlContact',
    password: '123456',
    database: 'bxlcontact'
});

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
    res.render('index', { tips: 'Please Log in !' })
}

exports.doLog = function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    // check data in database
    pool.getConnection((err, connection) => {
        getName(connection, (result) => {
            for (var i = 0; i < result.length; i++) {
                if (result[i].username == username) {
                    if (result[i].password == password) {
                        if (!req.session.username) {
                            req.session.username = username;
                        }
                        res.render('user/chatroom', { username: username })
                    } else {
                        res.render('index', { tips: 'Wrong Password !' })
                    }
                }
            }
            res.render('index', { tips: 'Wrong Username !' })
        })
    })
}


exports.Logout = function(req, res) {
    req.session.destroy();
    res.render('index', { tips: 'Please Log in !' })
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
    var addSqlParams = [username, password];
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