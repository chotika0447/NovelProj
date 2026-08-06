// models/ChapterBody.js
const mongoose = require('mongoose');

const bodySchema = new mongoose.Schema({
  chapter:     { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true, unique: true, index: true },
  contentHtml: { type: String }, // ถ้ามี HTML
  content:     { type: String }, // หรือเก็บ plain text
  words:       { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.models.ChapterBody || mongoose.model('ChapterBody', bodySchema);
