const User = require('../models/User');
const crypto = require('crypto');
const auth = require("./auth")
const Phone = require('../models/Phone');
const validator = require('email-validator');
//update user's profile
module.exports.updateProfile = async (req, res) => {
    try {
        const { firstname, lastname, email,password } = req.body;
        errors = []
        let originEmail = req.user.email;

        let passwordMd5 = crypto.createHash('md5').update(password).digest("hex")
        if (passwordMd5 != req.user.password) {
            req.flash('error_msg', 'Wrong password');
            res.redirect('/users#profile');
            return
        }

        if (originEmail != email) {
            // check if email is already taken
            let emailAlreadyTaken = await User.findOne({ email: email });
            if (emailAlreadyTaken) {
                req.flash('error_msg', 'Email already exists');
                res.redirect('/users#profile');
                return
            }
        }
        if (validator.validate(email)) {
            User.findOne({ email: originEmail }).then((user) => {
                user.email = email
                if (firstname) {
                    user.firstname = firstname
                }
                if (lastname) {
                    user.lastname = lastname
                }
                user.save().then((user) => {
                    req.flash(
                        'success_msg',
                        'Your profile is updated successfully'
                    );
                    res.redirect('/users#profile');
                });
            });
        } else {
            req.flash('error_msg', 'The email address is not valid');
            res.redirect('/users#profile');
            return
        }

    } catch (err) {
        console.error(err);
    }
};
//change user's password after login
module.exports.changePassword = async (req, res) => {
    try {
        const { password, newPassword, conPassword } = req.body;

        if (!password || !newPassword || !conPassword) {
            req.flash('error_msg', 'Please enter your password and confirm it' );
            res.redirect('/users#changePass');
            return
        }
        if (password == newPassword) {
            req.flash('error_msg', 'New password must be different from old password');
            res.redirect('/users#changePass');
            return
        }

        if (conPassword != newPassword) {
            req.flash('error_msg', 'New password confirmation is not matching');
            res.redirect('/users#changePass');
            return
        }

        const message = auth.validatePassword(newPassword);
        if (message) {
            req.flash('error_msg', message);
            res.redirect('/users#changePass');
            return
        }

        var passwordMd5 = crypto.createHash('md5').update(password).digest("hex");

        let email = req.user.email;
        User.findOne({ email: email }).then((user) => {
            if (passwordMd5 != user.password) {
                req.flash('error_msg', 'Password incorrect');
                res.redirect('/users#changePass');
                return
            }

            user.password = crypto.createHash('md5').update(newPassword).digest("hex");
            user.save().then((user) => {
                req.flash(
                    'success_msg',
                    'Your password is updated successfully, please login again'
                );
                req.logout()
                res.redirect('/auth/login');
            });
        });

    } catch (err) {
        console.error(err);
    }
};

//add phone list, along with validation check for price and stock
module.exports.addPhone = async (req, res) => {
    try {
        const { title, brand, image, stock, price } = req.body;
        const phone = new Phone({
            title: title,
            brand: brand,
            image: image,
            stock: stock,
            price: price,
            seller: req.user,
        })

        const isNumber = /^[1-9]\d*$/;
        if (!isNumber.test(stock)) {
            req.flash('error_msg', 'Stock should be a positive numbers');
            res.redirect('/users#manageList');
            return;
        }

        const isPrice = /^(?!0*[.,]0*$|[.,]0*$|0*$)\d+[,.]?\d{0,2}$/;
        if (!isPrice.test(price)) {
            req.flash('error_msg', 'Price should be positive numbers with maximum 2 decimals');
                res.redirect('/users#manageList');
        }else{
            phone.save().then(() => {
                req.flash(
                    'success_msg',
                    'add phone successfully'
                );
                res.redirect('/users#manageList');
            })
        }
      
    } catch (err) {
        console.error(err);
    }
};

//get user's phone list and pass variables to the user.ejs
module.exports.userView = async (req, res) => {
    let viewCommentPhoneID = req.query.viewCommentPhoneID;
    let phones = await Phone.getPhonesBySeller(req.user, 100);
    let comments = []
    if (viewCommentPhoneID) {
        let phone = await Phone.getPhoneById(viewCommentPhoneID);
        comments = phone.reviews;
    }
    res.render('users', {
        user: req.user,
        phones: phones,
        comments: comments,
    });
}

//switch user's phone in the list's status between disable and enable
module.exports.changePhoneStatus = async (req, res) => {
    try {
        let phoneID = req.query.phoneID;
        let status = req.query.status;

        Phone.findById(phoneID).then((phone) => {
            if (phone) {
                phone.disabled = status;
                phone.save().then(() => {
                    res.redirect('/users#manageList');
                })
            } else {
                res.redirect('/users#manageList');
            }
        })
    } catch (err) {
        console.error(err);
    }
};

//delete phone form phone list
module.exports.deletePhone = async (req, res) => {
    try {
        let phoneID = req.query.phoneID;

        Phone.deleteOne({ _id: phoneID }).then(() => {
            res.redirect('/users#manageList');
        })
    } catch (err) {
        console.error(err);
    }
};