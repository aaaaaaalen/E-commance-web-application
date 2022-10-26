const express = require('express');
// const expressLayouts = require('express-ejs-layouts'); // move to partials
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const favicon = require('serve-favicon');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

// Passport Config
require('./controllers/passport')(passport);

// DB Config
const db = require('./config/db');

// EJS
// Using the ejs as view engine
app.set('view engine', 'ejs');

// Declare styling and favicon
// Favicon provided by seekpng:
// https://www.seekpng.com/ipng/u2q8y3q8w7w7e6i1_image-transparent-background-white-phone-icon/
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(__dirname + '/public/img/favicon.ico'));

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true,
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Body parser
app.use(bodyParser.json());

// Global variables
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Routes
app.use('/', require('./routes/index.js')); // SPA main page
app.use('/auth', require('./routes/auth.js')); // Login/register/validation
app.use('/checkout', require('./routes/checkout.js')); // Checkout page
app.use('/phones', require('./routes/phones.js')); // Phones data
app.use('/users', require('./routes/users.js')); // User profile page

const PORT = process.env.PORT || 3000;

// Listen for events
app.listen(PORT, async () => {
    await db();
    console.log('Server is running on port 3000');
});
