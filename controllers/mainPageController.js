const Phone = require('../models/Phone');

// Define constants
const MP_STATE = {
    HOME: 'state_home',
    SEARCH: 'state_search',
    ITEM: 'state_item',
    ERROR: 'ERROR',
};

// View renders
module.exports.mainPageView = async (req, res) => {
    try {
        let data = {};

        data.soldOutSoonItems = await Phone.getPhonesByStock(1, 5);
        data.bestSellers = await Phone.getPhonesByRating(5);

        res.render('mainpage', {
            user: req.user,
            state: MP_STATE.HOME,
            data: data,
        });
    } catch (err) {
        console.error(err);
    }
};

/* UNUSED FUNCTIONS - for non-SPA version */
// module.exports.itemView = async (req, res) => {
//     try {
//         let data = {};
//         data.phone = await Phone.getPhoneById(req.params.id);
//         res.render('mainpage', {
//             user: req.user,
//             state: MP_STATE.ITEM,
//             data: data,
//         });
//     } catch (err) {
//         console.error(err);
//     }
// };

// module.exports.searchView = async (req, res) => {
//     try {
//         let data = {};
//         data.results = await Phone.getPhonesByName(req.params.name, 0);
//         data.brands = await Phone.getBrands();

//         res.render('mainpage', {
//             user: req.user,
//             state: MP_STATE.SEARCH,
//             data: data,
//         });
//     } catch (err) {
//         console.error(err);
//     }
// };
