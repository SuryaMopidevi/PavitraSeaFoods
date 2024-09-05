const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const faqSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    default :''
  },
  username: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const FAQ = mongoose.model('FAQ', faqSchema);

module.exports = FAQ;
