const express = require('express');
const router = express.Router();
const {
    ensureAuthenticated,
    forwardAuthenticated,
} = require('../controllers/auth');

// @route       GET /checkout
// @desc        Checkout main page
// @access      Private
router.get('/', ensureAuthenticated, (req, res) => {
    res.render('checkout', {
        user: req.user,
    });
});

// @route       GET /checkout
// @desc        Checkout main page
// @access      Private
router.get('/orderComplete', ensureAuthenticated, (req, res) =>
    res.render('orderComplete', {
        user: req.user,
    })
);

module.exports = router;
