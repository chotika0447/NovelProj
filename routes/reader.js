// routes/reader.js
const express = require('express');
const router = express.Router();
const Book = require('../models/Books');
const Chapter = require('../models/Chapters');

function fmtDate(d){
  return new Date(d).toLocaleDateString('th-TH', { day:'2-digit', month:'short', year:'numeric' });
}

router.get('/:chapterId', async (req, res, next) => {
  try {
    const books = await Book.find().sort({ rank: 1 }).lean();
    const categories = [...new Set(books.map(b => b.category))];
    const chapter = await Chapter.findById(req.params.chapterId).lean();
    if (!chapter) return res.status(404).render('404');

    const book = await Book.findById(chapter.book).lean();
    if (!book) return res.status(404).render('404');

    // prev/next
    const [prevCh, nextCh] = await Promise.all([
      Chapter.findOne({ book: chapter.book, index: { $lt: chapter.index } })
        .sort({ index: -1 }).select('_id index title').lean(),
      Chapter.findOne({ book: chapter.book, index: { $gt: chapter.index } })
        .sort({ index:  1 }).select('_id index title').lean(),
    ]);

    // ✅ ไม่ล็อก: เพิ่มยอดวิวเสมอ
    await Chapter.updateOne({ _id: chapter._id }, { $inc: { viewCount: 1 } });

    let user = null;
    if(req.session.user){
      user = req.session.user
    }
    res.render('reader', {
      pageTitle: `${book.title} — ตอนที่ ${chapter.index}`,
      user: req.session?.user || null,
      coins: user? user.coins : 0,
      categories,
      book: {
        id: String(book._id),
        title: book.title,
        slug: book.slug || null,
        coverUrl: book.img,
        category: book.category,
        rank: book.rank
      },
      chapter: {
        id: String(chapter._id),
        index: chapter.index,
        title: chapter.title,
        date: fmtDate(chapter.publishedAt || chapter.createdAt),
        content: chapter.content || '',              // ถ้าคุณเก็บเป็น contentHtml ให้ส่ง contentHtml
        viewCount: (chapter.viewCount || 0) + 1,
      },
      prevCh,
      nextCh
    });
  } catch (err) { next(err); }
});

module.exports = router;
