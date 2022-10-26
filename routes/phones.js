const express = require('express');
const { ensureAuthenticated } = require('../controllers/auth');
const controller = require('../controllers/phoneController');
const router = express.Router();

// @route       GET /phones
// @desc        Default method, returns all phones
// @access      Public
router.get('/', controller.getPhones);

// @route       GET /phones/:id
// @desc        Returns single phone matching :id
// @access      Public
router.get('/id/:id', controller.getPhoneById);

// @route       GET /phones/stock/:min/:limit/:order
// @desc        Returns at most :limit phones and with
//              at least :min stock sorted in :order
// @access      Public
router.get('/stock/:min/:limit/:order', controller.getPhonesByStock);

// @route       GET /phones/rating/:limit/:order
// @desc        Returns at most :limit phones with
//              average ratings sorted in :order
// @access      Public
router.get('/rating/:limit/:order', controller.getPhonesByRating);

// @route       GET /phones/name/:name/
// @desc        Returns phones with a
//              case-insensitive substring match with
//              :name
// @access      Public
router.get('/name/:name', controller.getPhonesByName);

// @route       GET /phones/brands
// @desc        Returns all unique brands in
//              lexicographical order
// @access      Public
router.get('/brands', controller.getBrands);

// @route       POST /phones/:id/reviews/:userId
// @desc        Submits a phone review for phone :id and under
//              the user :userId with text body :review
// @access      Private
router.post('/:id/reviews/:userId/', ensureAuthenticated, controller.submitReview);

// @route       POST /phones/:id/quantity/:qty
// @desc        Updates the quantity of stock for phone of id :id
//              with the quantity :qty
// @access      Private
router.post('/:id/quantity/:qty', ensureAuthenticated, controller.adjustStock);

module.exports = router;
