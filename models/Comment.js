// models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  book:    { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', index: true }, // optional
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  text:    { type: String, required: true },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  likeCount:   { type: Number, default: 0 },
  isTop:       { type: Boolean, default: false }
}, { timestamps: true });

commentSchema.index({ book: 1, createdAt: -1 });
commentSchema.index({ chapter: 1, createdAt: -1 });

module.exports = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
