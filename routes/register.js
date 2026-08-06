// routes/register.js
const express = require("express");
const bcrypt  = require("bcryptjs");
const User    = require("../models/User");     // ต้องมีฟิลด์ password ในสคีมา
const Book    = require("../models/Books");    // เอาไว้ดึง categories ใส่ navbar (ถ้าไม่ใช้ ตัดออกได้)

const router = express.Router();

// กันผู้ใช้ที่ล็อกอินอยู่ให้กลับหน้าแรก
function redirectIfLoggedIn(req, res, next) {
  if (req.session.user) return res.redirect("/");
  next();
}

// GET /register
router.get("/register", redirectIfLoggedIn, async (req, res) => {
  try {
    // ดึงหมวดหมู่ไว้แสดงใน navbar (ถ้าเทมเพลตไม่ใช้ categories จะตัดส่วนนี้ทิ้งก็ได้)
    const books = await Book.find().select("category -_id").lean();
    const categories = [...new Set(books.map(b => b.category).filter(Boolean))];

    res.render("register", {
      pageTitle: "สมัครสมาชิก",
      categories,                     // ป้องกัน error "categories is not defined"
      user: req.session.user || null, // ป้องกัน error "user is not defined"
    });
  } catch (err) {
    console.error("[GET /register]", err);
    res.render("register", { pageTitle: "สมัครสมาชิก", categories: [], user: null });
  }
});

// POST /register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, password2 } = (req.body || {});

    // ตรวจฟอร์มพื้นฐาน
    // if (!username || !email || !password) {
    //   return res.status(400).send(`<script>alert("กรุณากรอกข้อมูลให้ครบ");location="/register";</script>`);
    // }
    // if (typeof password2 !== "undefined" && password !== password2) {
    //   return res.status(400).send(`<script>alert("รหัสผ่านไม่ตรงกัน");location="/register";</script>`);
    // }
    // if (password.length < 6) {
    //   return res.status(400).send(`<script>alert("รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร");location="/register";</script>`);
    // }

    // เช็คซ้ำ
    // const existingUser = await User.findOne({ username: username.trim() }).lean();
    // if (existingUser) {
    //   return res.status(400).send(`<script>alert("Username นี้ถูกใช้แล้ว");location="/register";</script>`);
    // }
    // const existingEmail = await User.findOne({ email: (email || "").trim().toLowerCase() }).lean();
    // if (existingEmail) {
    //   return res.status(400).send(`<script>alert("อีเมลนี้ถูกใช้แล้ว");location="/register";</script>`);
    // }

    // เข้ารหัสรหัสผ่าน -> เก็บลงฟิลด์ password (ตามสคีมาที่คุณใช้)
    const hash = await bcrypt.hash(password, 10);
    const created = await User.create({
      username: username.trim(),
      email: (email || "").trim().toLowerCase(),
      password: hash,            // <<<<<< สำคัญ: ใช้ชื่อฟิลด์ 'password'
      role: "user",
      coins: 0
    });

    // auto-login หลังสมัครเสร็จ
    req.session.regenerate(err => {
      if (err) {
        console.error("session regenerate error:", err);
        return res.send(`<script>alert("สมัครสำเร็จ โปรดเข้าสู่ระบบ");location="/login";</script>`);
      }
      req.session.user = { id: created._id, username: created.username, email: created.email };
      req.session.save(() => res.send(`<script>alert("Registered successfully!");location="/";</script>`));
    });
  } catch (err) {
    // duplicate key (E11000)
    if (err && err.code === 11000) {
      return res.status(400).send(`<script>alert("ข้อมูลซ้ำ (username/email)");location="/register";</script>`);
    }
    console.error("[POST /register] error:", err);
    res.status(500).send(`<script>alert("เกิดข้อผิดพลาดในการสมัครสมาชิก");location="/register";</script>`);
  }
});

// ตรวจสอบ username ว่ามีอยู่ใน DB หรือไม่
router.get("/check-username", async (req, res) => {
  try {
    const { username } = req.query;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ exists: false });
  }
});

// ตรวจสอบ email ว่ามีอยู่ใน DB หรือไม่
router.get("/check-email", async (req, res) => {
  try {
    const { email } = req.query;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ exists: false });
  }
});

module.exports = router;
