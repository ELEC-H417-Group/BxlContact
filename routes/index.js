var express = require('express');
var router = express.Router();
var user = require("../controllers/user_controller");


/* GET home page. */
router.get('/', user.showLogin);
/* GET users listing. */
router.get('/sign', user.showSign);
router.post('/logout', user.Logout);
router.post('/do/sign', user.doSign);
router.post('/users/do/log', user.doLog);
router.get('/users/do/log', user.getDoLog);

module.exports = router;