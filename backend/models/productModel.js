const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productNumber: {
        type: String,
        required: true
    },
    productname: {
        type: String,
        required: true
    },
    img1 : {
        type: String,
        required: true
    },
    img2 : {
        type: String,
        required: true
    },
    img3 : {
        type: String,
        required: true
    },
    img4 : {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    count: {
        type: String,
        required: true,
        index: true
    },
    size: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    }

})

const Product = mongoose.model('Product',productSchema)
module.exports = Product