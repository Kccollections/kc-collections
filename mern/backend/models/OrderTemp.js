const mongoose = require('mongoose');

const OrderTempSchema = new mongoose.Schema({
  orderID: { type: String, required: true },
  items: { type: Array, required: true },
  totalAmount: { type: String, required: true },
});

module.exports = mongoose.model('OrderTemp', OrderTempSchema);
