const mongoose = require("mongoose");

const validation = mongoose.Schema({
    username : String,
    email : {
        type : String,
        unique: true
    },
    password : String
    // verificationCode : String
});
const valid = mongoose.model('register', validation)
module.exports = valid;