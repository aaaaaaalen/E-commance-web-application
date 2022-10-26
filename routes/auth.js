const express = require('express');
const router = express.Router();
const passport = require('passport');
const { forwardAuthenticated } = require('../controllers/auth');
const authController = require('../controllers/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/auth/login',
        failureFlash: true,
    })(req, res, next);
  });

// Logout
router.get('/logout', authController.getLogout);

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register')
);

// Register
router.post('/register', authController.addNewUser);

//email verification
router.get('/verify/:token', authController.getVerification);

// Reset Password request Page
router.get('/resetPassReq', forwardAuthenticated, (req, res) =>
    res.render('resetPassReq')
);

//head to reset password page
router.get('/resetPassword/:token', forwardAuthenticated, authController.getResetPassPage);

// Reset Password request
router.post('/resetPassReq', authController.getResetPassMail );

//reset password
router.post('/resetPassword', authController.updatePassword);

//reset password
router.get('/reset/:token', authController.getResetPassword);

module.exports = router;
