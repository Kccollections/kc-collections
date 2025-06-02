const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Reference Product schema
      addedAt: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('Wishlist', WishlistSchema);
