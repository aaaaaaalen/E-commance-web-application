const sanitize = require('regex-escape');
const Phone = require('../models/Phone');

// Wrappers for model methods
// Please refer to the commentary in models/Phone.js for the logic info
// Please refer to the commentary in routes/phones.js for route info
module.exports.getPhones = async (req, res) => {
    try {
        const phones = await Phone.getNPhones(100); // Limit the returned result
        res.json(phones);
    } catch (err) {
        console.error(err);
    }
};

module.exports.getPhoneById = async (req, res) => {
    try {
        const phones = await Phone.getPhoneById(req.params.id);
        res.json(phones);
    } catch (err) {
        console.error(err);
    }
};

module.exports.getPhonesByStock = async (req, res) => {
    try {
        const min_qty = Number(req.params.min);
        const find_limit = Number(req.params.limit);
        const order = req.params.order;
        const phones = await Phone.getPhonesByStock(
            min_qty,
            find_limit,
            (asc = order)
        );
        res.json(phones);
    } catch (err) {
        console.error(err);
    }
};

module.exports.getPhonesByRating = async (req, res) => {
    try {
        const find_limit = Number(req.params.limit);
        const order = req.params.order;
        const phones = await Phone.getPhonesByRating(find_limit, (asc = order));
        res.json(phones);
    } catch (err) {
        console.error(err);
    }
};

module.exports.getPhonesByName = async (req, res) => {
    try {
        const name = sanitize(req.params.name);
        const order = req.params.order;
        const phones = await Phone.getPhonesByName(name, (asc = order));
        res.json(phones);
    } catch (err) {
        console.error(err);
    }
};

module.exports.getBrands = async (req, res) => {
    try {
        const order = req.params.order;
        const phones = await Phone.getBrands();
        res.json(phones);
    } catch (err) {
        console.error(err);
    }
};

module.exports.submitReview = async (req, res) => {
    try {
        const pid = req.params.id;
        const uid = req.params.userId;
        const reviewRating = req.body.rating;
        const reviewBody = req.body.body;
        const modifiedPhone = await Phone.submitReview(
            pid,
            uid,
            reviewRating,
            reviewBody
        );

        res.json(modifiedPhone);
    } catch (err) {
        console.error(err);
    }
};

module.exports.adjustStock = async (req, res) => {
    try {
        const pid = req.params.id;
        const qty = Number.parseInt(req.params.qty);

        const modifiedPhone = await Phone.adjustStock(pid, qty);

        res.json(modifiedPhone);
    } catch (err) {
        console.error(err);
    }
};
