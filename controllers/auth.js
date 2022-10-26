const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const validator = require('email-validator');

/*Passport.js middleware for authenticate on any resource that needs to be protected.  If
  the request is authenticated (typically via a persistent login session),the request will proceed.  
  Otherwise, the user will be redirected to the login page. */
module.exports = {

    ensureAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Please log in to view that resource');
        res.redirect('/auth/login');
    },

    forwardAuthenticated: function (req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        }
        res.redirect('/');
    },
};

//log out, will redirect user to home page
module.exports.getLogout = async (req, res) => {
    try {
        req.logout();
        // req.flash('success_msg', 'You are logged out');
        res.redirect('/'); // required to redirect to home
    } catch (err) {
        console.error(err);
    }
};

/* Register read the parameters from post req, and process empty input check, password
matching check, email and password validation, then hashing the password by MD5, generate a token for email verification and use 
findOne function add it the the database, a confirmation email will send to user's email address*/
module.exports.addNewUser = async (req, res) => {
    try {
        const { firstname, lastname, email, password, password2 } = req.body;
        var confirmed = false;
        var token = null;
        let errors = [];

        if (!firstname || !lastname || !email || !password || !password2) {
            errors.push({ msg: 'Please enter all fields' });
        }

        if (password != password2) {
            errors.push({ msg: 'Passwords do not match' });
            res.render('register', {
                errors,
                firstname,
                lastname,
                email,
                password,
                password2,
            });
            return;
        }

        if (validator.validate(email)) {
            const message = validatePassword(password);
            //console.log(message);
            if (message) {
                errors.push({ msg: message });
                res.render('register', {
                    errors,
                    firstname,
                    lastname,
                    email,
                    password,
                    password2,
                });
            } else {
                User.findOne({ email: email }).then((user) => {
                    if (user) {
                        errors.push({ msg: 'Email already exists' });
                        res.render('register', {
                            errors,
                            firstname,
                            lastname,
                            email,
                            password,
                            password2,
                        });
                    } else {
                        const newUser = new User({
                            firstname,
                            lastname,
                            email,
                            password,
                            confirmed,
                            token,
                        });
                        //made password md5
                        const passwordMd5 = crypto
                            .createHash('md5')
                            .update(password)
                            .digest('hex');
                        const tokenRand = randString();
                        newUser.password = passwordMd5;
                        newUser.token = tokenRand;
                        //send a verification email
                        sendRegisterMail(email, tokenRand);
                        newUser.save().then((user) => {
                            req.flash(
                                'success_msg',
                                'You are now registered, Please confirm the verification email and then log in'
                            );
                            res.redirect('/auth/login');
                        });
                    }
                });
            }
        } else {
            errors.push({ msg: 'Invalid Email address' });
            res.render('register', {
                errors,
                firstname,
                lastname,
                email,
                password,
                password2,
            });
        }
    } catch (err) {
        console.error(err);
    }
};

//e-mail verification, check user's verification
module.exports.getVerification = async (req, res) => {
    try {
        const token = req.params.token;
        User.findOne({ token: token }).then((user) => {
            if (user) {
                //console.log(user)
                user.confirmed = true;
                user.token = null;
                user.save().then((user) => {
                    req.flash('success_msg', 'You are now verified');
                    res.redirect('/auth/login');
                });
            } else {
                req.flash('error_msg', 'Please try again');
                res.redirect('/auth/register');
            }
        });
    } catch (err) {
        console.error(err);
    }
};

//head to reset password page with token
module.exports.getResetPassPage = async (req, res) => {
    try {
        const token = req.params.token;
        res.render('resetPassword', { token: token });
    } catch (err) {
        console.error(err);
    }
};

//reset password by check the token
module.exports.getResetPassword = async (req, res) => {
    try {
        const token = req.params.token;
        User.findOne({ token: token }).then((user) => {
            if (user) {
                req.flash('success_msg', 'Please reset your password here');
                res.redirect('/auth/resetPassword/' + token);
            } else {
                req.flash('error_msg', 'Please try again');
                res.redirect('/auth/login');
            }
        });
    } catch (err) {
        console.error(err);
    }
};

//send reset password link
module.exports.getResetPassMail = async (req, res) => {
    try {
        const { email } = req.body;
        let errors = [];
        if (!email) {
            errors.push({ msg: 'Please enter your email' });
            res.render('resetPassReq', {
                errors,
                email,
            });
        } else {
            if (validator.validate(email)) {
                User.findOne({ email: email }).then((user) => {
                    if (user) {
                        const tokenRand = randString();
                        user.token = tokenRand;
                        user.save().then((user) => {
                            sendResetMail(email, tokenRand);
                            req.flash(
                                'success_msg',
                                'Reset link has send to your email address'
                            );
                        });
                    } else {
                        errors.push({ msg: 'Email is not exists' });
                        res.render('resetPassReq', {
                            errors,
                            email,
                        });
                    }
                });
            } else {
                errors.push({ msg: 'Invalid Email address' });
                res.render('resetPassReq', {
                    errors,
                    email,
                });
            }
        }
    } catch (err) {
        console.error(err);
    }
};

//reset the password by check not empty, matching and validation, and hash the password by MD5
module.exports.updatePassword = async (req, res) => {
    try {
        const { token, password, password2 } = req.body;
        let errors = [];

        if (!password || !password2) {
            errors.push({ msg: 'Please enter your password and confirm it' });
            res.render('resetPassword', {
                errors,
                token,
                password,
                password2,
            });
        }
        if (password != password2) {
            errors.push({ msg: 'Passwords do not match' });
            res.render('resetPassword', {
                errors,
                token,
                password,
                password2,
            });
            return;
        }

        const message = validatePassword(password);
        console.log(message);
        if (message) {
            errors.push({ msg: message });
            res.render('resetPassword', {
                errors,
                token,
                password,
                password2,
            });
        } else {
            User.findOne({ token: token }).then((user) => {
                if (user) {
                    const passwordMd5 = crypto
                        .createHash('md5')
                        .update(password)
                        .digest('hex');
                    user.password = passwordMd5;
                    user.token = null;
                    user.save().then((user) => {
                        req.flash(
                            'success_msg',
                            'Your password is reset successfully'
                        );
                        res.redirect('/auth/login');
                    });
                } else {
                    errors.push({ msg: 'Please try again' });
                    res.render('resetPassReq', {
                        errors,
                        email,
                    });
                }
            });
        }
    } catch (err) {
        console.error(err);
    }
};

//send verification email
const sendRegisterMail = (email, token) => {
    var Transport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'yzha8481@gmail.com', //put your gmail account here
            pass: 'zyf_940608', //put your password here
        },
    });
    var mailOptions;
    console.log(token);
    let sender = 'yzha8481@gmail.co';
    const output =
        'Press <a href = http://localhost:3000/auth/verify/' +
        token +
        '> here </a> to verify your email. Thanks';
    mailOptions = {
        from: sender,
        to: email,
        subject: 'Email confirmation',
        html: output,
    };

    Transport.sendMail(mailOptions, function (err, res) {
        if (err) {
            console.log(err);
        } else {
            console.log('Message sent');
        }
    });
};

//send reset password link
const sendResetMail = (email, token) => {
    var Transport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'yzha8481@gmail.com', //put your gmail account here
            pass: 'zyf_940608', //put your password here
        },
    });
    var mailOptions;
    //console.log(token);
    let sender = 'yzha8481@gmail.co';
    const output =
        'Press <a href = http://localhost:3000/auth/reset/' +
        token +
        '> here </a> to reset your password. Thanks';
    mailOptions = {
        from: sender,
        to: email,
        subject: 'Reset password',
        html: output,
    };

    Transport.sendMail(mailOptions, function (err, res) {
        if (err) {
            console.log(err);
        } else {
            console.log('Message sent');
        }
    });
};

//generate a token
const randString = () => {
    const len = 19;
    let randStr = '';
    for (let i = 0; i < len; i++) {
        const ch = Math.floor(Math.random() * 10 + 1);
        randStr += ch;
    }
    return randStr;
};

//password validation in order to use it in the user.js
module.exports.validatePassword = (password) => {
    return validatePassword(password);
}

//password validation
const validatePassword = (password) => {
    const isNonWhiteSpace = /^(?=.*\s)/;
    if (isNonWhiteSpace.test(password)) {
        return 'Password must not have whitespace.';
    }
    const isContainsUppercase = /(?=.*[A-Z])/;
    if (!isContainsUppercase.test(password)) {
        return 'Password must have at least one Uppercase Character.';
    }

    const isContainsLowercase = /^(?=.*[a-z])/;
    if (!isContainsLowercase.test(password)) {
        return 'Password must have at least one Lowercase Character.';
    }

    const isContainsNumber = /^(?=.*[0-9])/;
    if (!isContainsNumber.test(password)) {
        return 'Password must contain at least one Digit.';
    }

    const isContainsSymbol = /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹])/;
    if (!isContainsSymbol.test(password)) {
        return 'Password must contain at least one Special Symbol.';
    }

    const isValidLength = /^.{8,16}$/;
    if (!isValidLength.test(password)) {
        return 'Password must be 8-16 Characters Long.';
    }

    return null;
};
