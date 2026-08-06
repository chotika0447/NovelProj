// routes/writer.js
const express = require("express");
const router = express.Router();
const Book = require("../models/Books");
const Chapter = require("../models/Chapters");
const User = require("../models/User");
const multer = require("multer");

// ---------------- Routes --------------------

// หน้าหลักนักเขียน
router.get("/", async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id).select("coins").lean();
        const coins = user.coins;
        const books = await Book.find().sort({ rank: 1 }).lean()
        const categories = [...new Set(books.map(b => b.category))]
        // ✅ ดึงเฉพาะหนังสือที่ user คนนี้เป็นคนเขียน
        const allBooks = await Book.find({ author: req.session.user.id }).sort({ createdAt: -1 });

        res.render("writtenNovels", {
            title: "งานเขียนทั้งหมด",
            drafts: allBooks.filter(b => !b.isPublic),   // แบบร่าง
            published: allBooks.filter(b => b.isPublic), // เผยแพร่แล้ว
            user: req.session.user,
            coins,
            categories
        });
    } catch (err) {
        console.error(err);
        res.render("writtenNovels", { title: "งานเขียนของคุณ", drafts: [], published: [] });
        console.log("ไม่ได้")
    }
});

// ----------------- Upload -----------------
const upload = multer({ dest: "public/uploads/" });
router.post("/upload/cover", upload.single("cover"), (req, res) => {
  if (!req.file) return res.json({ success: false });
  res.json({ success: true, url: `/uploads/${req.file.filename}` });
});

router.post("/upload/profile", upload.single("profile"), (req, res) => {
  if (!req.file) return res.json({ success: false });
  res.json({ success: true, url: `/uploads/${req.file.filename}` });
});

// สร้างนิยายใหม่
router.get("/works/new", async (req, res) => {
    const user = await User.findById(req.session.user.id).lean();
    const coins = user.coins;
    const books = await Book.find().sort({ rank: 1 }).lean();
    const categories = [...new Set(books.map(b => b.category))];
    res.render("add", { novel: null,book: null, totalEp: 0, title: "สร้างนิยายใหม่",user,coins,categories: categories.slice(0,10) });
});

// แก้ไขนิยายที่มีอยู่
router.get("/works/:id", async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        const chapters = await Chapter.find({ book: book._id }).sort({ index: 1 });
        res.render("add", { book, totalEp: chapters.length, title: "แก้ไขนิยาย" });
    } catch (err) {
        console.error(err);
        res.redirect("/");
    }
});

// ดึงข้อมูลนิยายตาม ID
router.get("/api/book/:id", async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.json({ success: false });
        const chapters = await Chapter.find({ book: book._id }).sort({ index: 1 });
        res.json({ success: true, book, chapters });
    } catch (err) {
        console.error(err);
        res.json({ success: false });
    }
});

// เพิ่มตอนใหม่
// ----------------- Chapters -----------------
router.post("/:bookId/chapters", async (req, res) => {
  try {
    const { bookId } = req.params;
    const { title, content } = req.body;
    const totalChapters = await Chapter.countDocuments({ book: bookId });
    const newChapter = new Chapter({ book: bookId, index: totalChapters + 1, title, content });
    await newChapter.save();
    await Book.findByIdAndUpdate(bookId, { $inc: { totalChapters: 1 } });
    res.json({ success: true, chapter: newChapter, totalChapters: totalChapters + 1 });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

// ลบตอน
router.delete("/:bookId/chapters/:chapterId", async (req, res) => {
  try {
    const { bookId, chapterId } = req.params;
    await Chapter.findByIdAndDelete(chapterId);
    const totalChapters = await Chapter.countDocuments({ book: bookId });
    await Book.findByIdAndUpdate(bookId, { totalChapters });
    res.json({ success: true, totalChapters });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});


// แก้ไข & บันทึกหนังสือ
// router.post("/book/save", async (req, res) => {
//     try {
//         const { bookId, title, category, desc, img, isPublic, pricePerChapter } = req.body; // ✅ ดึงฟิลด์ใหม่มาใช้

//         let book;
//         if (bookId) {
//             book = await Book.findById(bookId);
//             if (!book) return res.json({ success: false });
//             book.title = title;
//             book.category = category;
//             book.desc = desc;
//             book.img = img;
//             book.isPublic = isPublic;
//             if (pricePerChapter !== undefined) book.pricePerChapter = pricePerChapter; // ✅ update ฟิลด์ใหม่
//         } else {
//             book = new Book({
//                 title,
//                 category,
//                 desc,
//                 img,
//                 isPublic,
//                 pricePerChapter,
//                 author: req.session.user.id   // ✅ เพิ่มตรงนี้
//             }); // ✅ create พร้อมฟิลด์ใหม่
//         }

//         await book.save();
//         res.json({ success: true, bookId: book._id });
//     } catch (err) {
//         console.error(err);
//         res.json({ success: false });
//     }
// });

// ----------------- Book -----------------
router.post("/save", async (req, res) => {
  try {
    const { bookId, title, category, desc, img, isPublic } = req.body;

    let book;
    if (bookId) {
      book = await Book.findById(bookId);
      if (!book) return res.json({ success: false });

      book.title = title;
      book.category = category;
      book.desc = desc;
      book.img = img;
      book.isPublic = isPublic ?? true;
    } else {
      book = new Book({
        title,
        category,
        desc,
        img,
        isPublic: isPublic ?? true,
        author: { author: req.session.user.id }
      });
    }

    await book.save();
    res.json({ success: true, bookId: book._id });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

module.exports = router;