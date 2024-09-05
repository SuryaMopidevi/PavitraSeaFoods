const mongoose = require("mongoose");

const Feedback = mongoose.Schema({
    rating : Number,
    comment : String
});
const customer = mongoose.model('feedback', Feedback)
module.exports = customer;