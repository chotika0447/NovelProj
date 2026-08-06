// models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  packageId: String,
  amountTHB: Number,
  coins: Number,
  status: { type: String, enum: ['PENDING','PAID','EXPIRED','FAILED'], default: 'PENDING' },
  gateway: String,
  gatewayPaymentId: String,
  qrcodeUrl: String,
  expiresAt: Date,
  createdAt: { type: Date, default: Date.now },
  paidAt: Date,
  processedAt: Date
});

module.exports = mongoose.model('Order', OrderSchema);
