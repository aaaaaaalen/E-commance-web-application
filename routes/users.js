const express = require('express');
const router = express.Router();
const {
    ensureAuthenticated,
    forwardAuthenticated,
} = require('../controllers/auth');
const userController = require('../controllers/user');

//user page
router.get('/', ensureAuthenticated, userController.userView);

//update profile
router.post('/updateProfile', ensureAuthenticated, userController.updateProfile);

//change password
router.post('/changePassword', ensureAuthenticated, userController.changePassword);

//add new phone to the list
router.post('/addPhone', ensureAuthenticated, userController.addPhone);

//change phone's status
router.get('/changePhoneStatus', ensureAuthenticated, userController.changePhoneStatus);

//delete phone from user's list
router.get('/deletePhone', ensureAuthenticated, userController.deletePhone);

module.exports = router;
