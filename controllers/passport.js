const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');

// Load User model
const User = require('../models/User');
//middleware to check user name and password for login process
module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      User.findOne({
        email: email
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }
        //check email verification
        if (user.confirmed != true){
          return done(null, false, { message: 'That email is not confirmed' });
        }

        // Match password
        var passwordMd5 = crypto.createHash('md5').update(password).digest("hex");
        if (passwordMd5 != user.password) {
          return done(null, false, { message: 'Password incorrect' });
        } else {
          
          return done(null, user);
        }
      });


    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};
