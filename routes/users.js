const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users')
const passport = require('passport');
const { storeReturnTo } = require('../middleware');

router.route('/register')
    .get(users.renderRegisterForm)
    .post(catchAsync(users.register));

router.route('/login')
    .get(users.renderLoginForm)
    .post(storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

router.get('/logout', users.logout);

module.exports = router;