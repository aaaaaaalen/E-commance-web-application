const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        firstname: {
            type: String,
            required: true,
        },
        lastname: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        confirmed: {
            type: Boolean,
            defaultValue: false,
        },
        token: {
            type: String,
            defaultValue: null,
        },
    },
    { collection: 'User', versionKey: false }
);

const User = mongoose.model('User', UserSchema, 'userlist');

module.exports = User;
