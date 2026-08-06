const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const path = require("path")
const router = express.Router();
const Book = require("../models/Books")

function redirectIfLoggedIn(req, res, next) {
  if (req.session.user) {
    return res.redirect("/");
  }
  next();
}

router.get("/login", async (req, res) => {
  try {
    // ดึงเฉพาะ field ที่ใช้ เช่น name
    const books = await Book.find().select("category -_id").lean();
    const categories = [...new Set(books.map(b => b.category).filter(Boolean))];

    // limit ไม่เกิน 10-15 อัน
    res.render("login", { 
      categories: categories.slice(0, 10), 
      user: req.session.user 
    });
  } catch (err) {
    console.error("Error loading categories:", err);
    res.render("login", { categories: [], user: req.session.user });
  }
});


// Login
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.usernameValue });
    if (!user) return res.status(400).json({ msg: "Username หรือ Password ไม่ถูกต้อง!" });
    const password = await bcrypt.compare(req.body.passwordValue, user.password);
    if (!password) return res.status(400).json({ msg: "Username หรือ Password ไม่ถูกต้อง!" });
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email
    };
    if (req.body.remember) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 วัน
    } else {
      req.session.cookie.expires = false; // session cookie (หายตอนปิด browser)
    }

    res.json({ redirect: "/" });

  } catch (err) {
    res.status(500).send(err);
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send("Logout error");
    res.redirect("/login");
  });
});

module.exports = router;
