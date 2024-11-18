const mongoose = require("mongoose");

const contactUs = mongoose.Schema({
    name : String,
    gmail : String,
    subject : String,
    message : String
});
const Contact = mongoose.model('contactUs', contactUs)
module.exports = Contact;