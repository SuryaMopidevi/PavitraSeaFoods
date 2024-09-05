const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  email: String,
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
module.exports = Wishlist;