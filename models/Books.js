//models/Books.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title:     { type: String, required: true, trim: true },
  author:    {author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }},
  isPublic:  { type: Boolean, default: true },
  category:  { type: String, index: true },
  desc:      String,
  img:       String,
  rank:      { type: Number, index: true, sparse: true },
  slug:      { type: String, lowercase: true, trim: true, index: true, sparse: true },
  totalChapters: Number
}, { timestamps: true });

bookSchema.virtual('detailPath').get(function(){
  return `/books/${this.slug || this._id}`;
});

module.exports = mongoose.models.Book || mongoose.model('Book', bookSchema);
