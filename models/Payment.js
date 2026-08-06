// models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['promptpay','credit','admin'], default: 'promptpay' },
  status: { type: String, enum: ['pending','paid','failed'], default: 'pending', index: true },
  ref:    { type: String, index: true } // txn id จากเกตเวย์
}, { timestamps: true });

module.exports = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
