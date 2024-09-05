const mongoose = require('mongoose');

const detailsSchema = new mongoose.Schema({
    email: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    gender: { type: String, required: true },
    phonenumber: { type: String, required: true },
    profileUrl: { type: String, required: true }
});

const PersonalDetails = mongoose.model('PersonalDetails', detailsSchema);

module.exports = PersonalDetails;
