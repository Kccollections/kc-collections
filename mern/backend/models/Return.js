const mongoose = require('mongoose');

const ReturnSchema = new mongoose.Schema(
  {
    orderId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Order', 
      required: true 
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    items: [
      {
        productId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'Product', 
          required: true 
        },
        quantity: { 
          type: Number, 
          required: true 
        },
        reason: { 
          type: String, 
          required: true 
        }
      },
    ],
    status: { 
      type: String, 
      enum: ['Pending', 'Approved', 'Rejected', 'Completed'], 
      default: 'Pending' 
    },
    returnMethod: { 
      type: String, 
      enum: ['Pickup', 'Drop-off'], 
      required: true 
    },
    pickupAddress: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Address', 
      required: true 
    },
    trackingId: { 
      type: String, 
      default: null 
    },
    refundAmount: { 
      type: Number, 
      default: 0 
    },
    refundStatus: { 
      type: String, 
      enum: ['Pending', 'Processed', 'Completed'], 
      default: 'Pending' 
    },
    comments: { 
      type: String 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
    updatedAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Return', ReturnSchema);