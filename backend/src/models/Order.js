const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    clientId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['PENDING', 'FULFILLED', 'FAILED'],
      default: 'PENDING',
      index: true,
    },
    fulfillmentId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
