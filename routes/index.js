const express = require('express');
const router = express.Router();
const {
    ensureAuthenticated,
    forwardAuthenticated,
} = require('../controllers/auth');

const { mainPageView } = require('../controllers/mainPageController');

// @route       GET /
// @desc        Marketplace main page
// @access      Public
router.get('/', (req, res) => {
    mainPageView(req, res);
});

/* UNUSED FUNCTIONS */
// // TODO: delete this to make into SPA
// // @route       GET /item/:id
// // @desc        Placeholder to view item info
// // @access      Public
// router.get('/item/:id', (req, res) => {
//     itemView(req, res);
// });

// // TODO: delete this to make into SPA
// // @route       GET /search/
// // @desc        Placeholder to do search
// // @access      Public
// router.get('/search/:name', (req, res) => {
//     searchView(req, res);
// });

module.exports = router;
