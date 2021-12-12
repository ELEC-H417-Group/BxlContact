
const username = undefined

exports.showSign = function(req, res) {
    res.render('user/sign');
}

exports.doSign = function(req, res) {

    username = req.body.username;
    var password = req.body.password;
    
    res.send('Well Done' + username + 'Your password is' + password);
}

exports.showLogin = function(req, res) {
    res.render('index')
}

exports.doLog = function(req, res) {
    //var username = req.body.username;
    //var password = req.body.password;
    // check data in database
    res.render('user/chatroom')
}
exports.mainUser = {
    username:username
}
