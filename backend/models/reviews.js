const mongoose = require("mongoose");

const Review = mongoose.Schema({
    productId : String,
    review : String,
    username : String
});
const review = mongoose.model('reviews', Review)
module.exports = review;