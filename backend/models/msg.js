const mongoose = require("mongoose");

const Details = mongoose.Schema({
    name : String,
    gmail : String,
    subject : String,
    message : String
});
const msg = mongoose.model('details', Details)
module.exports = msg;