// models/Cart.js
const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, default: 1 },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Cart', CartSchema);
