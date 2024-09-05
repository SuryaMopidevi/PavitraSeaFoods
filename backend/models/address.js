const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  email: { type: String, required: true },
  username: { type: String, required: true },
  address: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  phonenumber: { type: String, required: true },
  // dressing : {type:Boolean,required : false,default :false}
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
