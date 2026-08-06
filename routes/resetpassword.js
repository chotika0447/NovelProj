const express = require("express")
const router = express.Router();
const Book = require("../models/Books")
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const User = require("../models/User")

let otpStore = {}; // เก็บ OTP ชั่วคราว { email: { code, expires } }

function redirectIfLoggedIn(req, res, next) {
  if (req.session.user) {
    return res.redirect("/");
  }
  next();
}

router.get("/resetPassword",redirectIfLoggedIn, async (req, res) => {
  try {
          const books = await Book.find().select("category -_id").lean();
          const categories = [...new Set(books.map(b => b.category).filter(Boolean))];
          res.render('resetpassword', {
              categories: categories.slice(0, 10),
          });
      
          } catch (err) {
      console.log(err);
      res.send("Error fetching data");
    }
})

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 หลัก
}

const transporter = nodemailer.createTransport({
  service: "gmail", // หรือ SMTP provider อื่น
  auth: {
    user: process.env.EMAIL_FOROTP,
    pass: process.env.EMAIL_PASS
  }
});

// กดปุ่มส่ง OTP
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  const otp = generateOTP();
  const expires = Date.now() + 5 * 60 * 1000; // หมดอายุใน 5 นาที

  otpStore[email] = { code: otp, expires };

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FOROTP,
      to: email,
      subject: "OTP for password reset",
      text: `Website Ei Novel, Your OTP is ${otp}, valid for 5 minutes.`
    });
    res.json({ message: "OTP ส่งไปยังอีเมลแล้ว" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "ส่งอีเมลไม่สำเร็จ" });
  }
});

router.post("/resetPassword", async(req,res)=>{
    const { email, otp, newPassword } = req.body;

    if (!otpStore[email]) {
        return res.status(400).json({ status: 0,message: "ยังไม่ส่ง OTP" });
    }

    const { code, expires } = otpStore[email];
    if (Date.now() > expires) {
        return res.status(400).json({ status: 1,message: "OTP หมดอายุ" });
    }
    if (otp !== code) {
        return res.status(400).json({ status: 2,message: "OTP ไม่ถูกต้อง" });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await User.findOneAndUpdate({ email }, { password: hashedPassword });

        delete otpStore[email];

        res.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ (กำลังกลับไปหน้า Log in)" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
});


module.exports = router