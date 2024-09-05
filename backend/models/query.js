const mongoose = require("mongoose");

const Query = mongoose.Schema({
    name : String,
    gmail : String,
    subject : String,
    query : String,
    answer : {
        type : String,
        default:''
    }
});
const query = mongoose.model('query', Query)
module.exports = query;