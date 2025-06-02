const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, required: true },
      },
    ],
    address: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, default: 'Pending' },
    payment_method: { type: String, enum: ['COD', 'ONLINE'], required: true },
    paymentMode: {
      type: String,
      enum: ['Card', 'UPI', 'Net Banking', 'Wallet'],
      validate: {
        validator: function (value) {
          return this.payment_method === 'ONLINE' ? value != null : true;
        },
        message: 'Payment mode is required for online orders.',
      },
    },
    paymentIntentId: {
      type: String,
      validate: {
        validator: function (value) {
          return this.payment_method === 'ONLINE' ? value != null : true;
        },
        message: 'Payment Intent ID is required for online orders.',
      },
    },
    shippingStatus: {
      type: String,
      enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    trackingId: { type: String, default: null }, // Shiprocket Tracking ID
    trackingUrl: { type: String, default: null }, // Tracking URL provided by Shiprocket
    shipmentId: { type: String, default: null }, // Shiprocket Shipment ID
    shippingDate: { type: Date, default: null }, // When the order was shipped
    deliveryDate: { type: Date, default: null }, // Estimated or actual delivery date
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
