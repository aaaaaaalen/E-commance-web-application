const mongoose = require('mongoose');
const config = require('config');
//mongodb connection enter it by using default.json
module.exports = () => {
    const fullPath = config.get('mongoBaseURI') + config.get('mongoDBName');

    return mongoose
        .connect(fullPath, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => console.log('MongoDB Connected'))
        .catch((err) => console.log(err));
};
