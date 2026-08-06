// routes/home.js
const express = require('express');
const router = express.Router();
const Book = require('../models/Books');
const User = require("../models/User");

router.get('/', async (req, res, next) => {
  

  try {
    
    const books = await Book.find().sort({ rank: 1 }).lean();

    // group by category
    const grouped = {};
    for (const b of books) {
      const cat = b.category || 'อื่นๆ';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push({
        link: b.link || `/books/${b.rank}`,
        img: b.img || '/images/placeholder.jpg',
        name: b.title
      });
    }

    const categories = Object.keys(grouped);
    const sections = categories.map(cat => ({
      title: cat,
      items: grouped[cat]
    }));

    const topCharts = books.slice(0, 12).map(b => ({
      link: b.link || `/books/${b.rank}`,
      img: b.img || '/images/placeholder.jpg',
      name: b.title,
      desc: b.desc,
      category: b.category
    }));

    // ดึง coins เฉพาะเวลา login (และใช้เฉพาะ field)
    let coins = 0;
    if (req.session.user) {
      const user = await User.findById(req.session.user.id).select("coins").lean();
      coins = user ? user.coins : 0;
    }

    res.render('index', {
      user: req.session.user,
      mainBanner: 'https://cdn.readawrite.com/banner/7105/MINI/600/banner_img.png?2025-09-0114:49:23',
      categories,
      sections,
      topCharts,
      coins
    });
  } catch (err) { next(err); }
});

router.get('/category/:name', async (req, res) => {
  const categoryName = req.params.name;
  let coins = 0;
  if (req.session.user) {
    const user = await User.findById(req.session.user.id).select("coins").lean();
    coins = user ? user.coins : 0;
  }
  try {
    //เอา category มาหมดเลย เพราะจะเอาไปแสดงบน nav
    const books = await Book.find().sort({ rank: 1 });
    const categories = [...new Set(books.map(b => b.category))];
    categories.slice(0, 10);
    //หาเฉพาะ category นั้นๆ
    const book = await Book.find({ category: categoryName }).sort({ rank: 1 }).lean();
    // สร้าง link ให้แต่ละ book
    const booksWithLink = book.map(b => ({
      ...b,
      link: `/books/${b._id}` // หรือใช้ slug ถ้ามี
    }));
    const category = [...new Set(book.map(b => b.category))];
    res.render('categories', {
      book: booksWithLink, categories, category, user: req.session.user, coins
    })
  } catch (err) {
    res.status(500).send("เกิดข้อผิดพลาด: " + err.message);
  }
})

router.get('/search', async (req, res) => {

  try {
    let coins = 0;
    if (req.session.user) {
      const user = await User.findById(req.session.user.id).select("coins").lean();
      coins = user ? user.coins : 0;
    }
    const allbook = await Book.find().sort({ rank: 1 });
    const Navcategories = [...new Set(allbook.map(b => b.category))]
    const query = req.query.q || "";
    const books = await Book.find({
      title: { $regex: query, $options: "i" }
    }).sort({ rank: 1 }).lean()
    const booksWithLink = books.map(b => ({
      ...b,
      link: `/books/${b._id}` // หรือใช้ slug ถ้ามี
    }));
    const categories = [...new Set(books.map(b => b.category))];
    res.render("searchResults", {
      books: booksWithLink,
      query,
      categories,
      Navcategories,
      user: req.session.user,
      coins: coins
    });
  } catch (error) {
    res.status(500).send("เกิดข้อผิดพลาด: " + error.message);
  }
})

module.exports = router;
