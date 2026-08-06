// routes/books.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Book = require('../models/Books');
const Chapter = require('../models/Chapters');
const User = require("../models/User");

function fmt(d) { return new Date(d).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' }); }

// ถ้า server.js มี app.use('/books', router) ต้องเป็น '/:id'
router.get('/:id', async (req, res, next) => {
  try {
    let user = null;
    if (req.session.user) {
      // ดึงจาก DB เพื่อให้ coin อัปเดตตลอด
      user = await User.findById(req.session.user.id).lean();
    }

    const { id } = req.params;
    let book = null;

    // (ตัวเลือก) ให้ slug มาก่อน เพื่อกันเคส slug เป็นตัวเลข
    book = await Book.findOne({ slug: id }).lean();
    if (!book && mongoose.Types.ObjectId.isValid(id)) {
      book = await Book.findById(id).lean();
    }
    if (!book && /^\d+$/.test(id)) {
      book = await Book.findOne({ $or: [{ rank: Number(id) }, { rank: id }] }).lean();
    }

    if (!book) return res.status(404).render('404', { url: req.originalUrl });

    // กันเคส book ใน Chapter ถูกเก็บเป็น string
    const chapters = await Chapter.find({
      $or: [{ book: book._id }, { book: String(book._id) }]
    }).sort({ index: 1 }).lean();

    const books = await Book.find().sort({ rank: 1 }).lean();
    const unlockedChapters = (user && Array.isArray(user.unlockedChapters)) ? user.unlockedChapters : [];
    const categories = [...new Set(books.map(b => b.category))];
    categories.slice(0, 10);
    res.render('books', {
      categoriesnav: categories,
      pageTitle: `${book.title} - รายละเอียด`,
      theme: 'light',
      user: { isAuthenticated: !!req.session?.user, coins: req.session?.user?.coins || 0 },
      categories: [book.category].filter(Boolean),
      user: user ? user : null,
      coins: user ? user.coins : 0,

      novel: {
        id: String(book._id),
        name: book.title,
        author: book.author || 'ไม่ระบุผู้เขียน',
        coverUrl: book.img,
        isPublic: true,
        tags: [book.category].filter(Boolean),
        blurb: book.desc || '',
        totalChapters: chapters.length,
      },

      chapters: chapters.map(ch => ({
        id: String(ch._id),
        index: ch.index,
        title: ch.title,
        date: ch.publishedAt,
        cost: ch.cost || 0,
        isFree: !!ch.isFree,
        unlocked: !!ch.isFree || unlockedChapters.some(c => c.chapterId.toString() === ch._id.toString())
      })),

      comments: [],
      firstReadableId: chapters[0] ? String(chapters[0]._id) : null,
      firstReadableIndex: chapters[0]?.index || null,
      firstReadableLocked: false
    });
  } catch (e) { next(e); }
});

module.exports = router;
