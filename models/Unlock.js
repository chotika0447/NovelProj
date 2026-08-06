// models/Unlock.js
const mongoose = require('mongoose');

const unlockSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  book:    { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true, index: true },
  price:   { type: Number, default: 0 },
  source:  { type: String, enum: ['single','bundle','gift','admin'], default: 'single' }
}, { timestamps: true });

unlockSchema.index({ user: 1, chapter: 1 }, { unique: true }); // ปลดล็อกซ้ำไม่ได้

module.exports = mongoose.models.Unlock || mongoose.model('Unlock', unlockSchema);
