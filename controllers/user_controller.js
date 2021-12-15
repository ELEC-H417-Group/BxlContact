exports.showSign = function(req, res) {
    res.render('user/sign');
}

exports.doSign = function(req, res) {

    var username = req.body.username;
    var password = req.body.password;

    res.send('Well Done' + username + 'Your password is' + password);
}

exports.showLogin = function(req, res) {
    if (req.session.username) {
        var username = req.session.username
        res.render('user/chatroom', {
            username: username
        })
    }
    res.render('index')
}

exports.doLog = function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    if (!req.session.username) {
        req.session.username = username;
    }
    // check data in database

    res.render('user/chatroom', { username: username })
}