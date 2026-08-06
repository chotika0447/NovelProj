// routes/topup.js
const express = require('express');
const router = express.Router();
const Book = require("../models/Books");
const User = require("../models/User");

// You can move this to DB later
const PACKAGES = [
  { id: 'c20',   label: '20 บาท',   coins: 20,  bonus: 0,   price: 20 },
  { id: 'c50',   label:   '50 บาท',  coins: 50,  bonus: 5,   price: 50 },
  { id: 'c100',  label: '100 บาท',  coins: 100, bonus: 10,  price: 100 },
  { id: 'c250',  label: '250 บาท',  coins: 250, bonus: 50,  price: 250 },
  { id: 'c500',  label: '500 บาท',  coins: 500, bonus: 100, price: 500 }
];

router.get('/', async(req, res) => {
  try{
    const books = await Book.find().sort({ rank: 1 }).lean();
    const categories = [...new Set(books.map(b => b.category || 'อื่นๆ'))];
    const user = await User.findById(req.session.user.id).lean();
    res.render('topup', {
    pageTitle: 'เติมเหรียญ',
    packages: PACKAGES,
    user: req.session.user || null,
    categories: categories.slice(0,10),
    coins: user ? user.coins : 0
  });
  } catch(err){
    res.redirect('/home')
  }
});

module.exports = router;
