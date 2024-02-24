const mongoose = require("mongoose");
const passpostLocalMongoose = require('passport-local-mongoose')
const Schmea = mongoose.Schema;

const userSchema = new Schmea({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    }
});


userSchema.plugin(passpostLocalMongoose);

module.exports = mongoose.model('User', userSchema);