const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema(
  {
    clientId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['CREDIT', 'DEBIT', 'ORDER_DEBIT'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    referenceType: {
      type: String,
      default: null,
    },
    referenceId: {
      type: String,
      default: null,
    },
    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ledger', ledgerSchema);
