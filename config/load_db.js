const mongoose = require('mongoose');
const config = require('config');

const Phone = require('../models/Phone');
const User = require('../models/User');

const phoneJson = require('./phonelisting.json');
const userJson = require('./userlist.json');

const fullPath = config.get('mongoBaseURI') + config.get('mongoDBName');

// Fix mapping of $oid to _id
userJson.map((user) => {
    user._id = user._id.$oid;
});

async function task() {
    await Phone.insertMany(phoneJson);
    await User.insertMany(userJson);
}

mongoose
    .connect(fullPath, {
        useNewUrlParser: true,
    })
    .then(() => task())
    .catch(() => {})
    .then(() => {
        console.log(
            `Users and Phones Loaded into database ${config.get('mongoDBName')}`
        );
        mongoose.connection.close();
    });
