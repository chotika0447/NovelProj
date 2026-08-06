// models/PaymentLog.js (กันเครดิตซ้ำ)
const mongoose = require('mongoose');

const PaymentLogSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  coins: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PaymentLog', PaymentLogSchema);