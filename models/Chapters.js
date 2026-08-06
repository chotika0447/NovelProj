// models/Chapters.js
const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  book:       { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
  index:      { type: Number, required: true },           // ตอนที่ #
  title:      { type: String, required: true, index: true },
  isFree:     { type: Boolean, default: false },
  cost:       { type: Number, default: 0 },
  publishedAt:{ type: Date, default: Date.now, index: true },
  // เก็บเนื้อหาแบบง่าย (ถ้ามี HTML เปลี่ยนเป็น contentHtml ก็ได้)
  content:    { type: String, default: '' },

  viewCount:     { type: Number, default: 0 },
  likeCount:     { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  status:     { type: String, enum: ["draft", "published"], default: "draft" }
}, { timestamps: true });

// กันซ้ำ และช่วย prev/next วิ่งไว
chapterSchema.index({ book: 1, index: 1 }, { unique: true });

module.exports = mongoose.models.Chapter || mongoose.model('Chapter', chapterSchema);
