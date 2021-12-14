var express = require('express');
var router = express.Router();
var user = require("../controllers/user_controller");


/* GET home page. */
router.get('/', user.showLogin);
/* GET users listing. */
router.get('/users/sign', user.showSign);

router.post('/users/do/sign', user.doSign);

router.post('/users/do/log', user.doLog);

module.exports = router;