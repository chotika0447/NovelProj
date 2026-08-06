// routes/coin.js
const express = require('express');
const router = express.Router();
const Book = require("../models/Books");
const Order = require("../models/Order");
const User = require("../models/User");

const PACKAGES = {
  c20:   { id: 'c20',   coins: 20,   bonus: 0,   price: 20  },
  c50:   { id: 'c50',   coins: 50,   bonus: 5,   price: 50  },
  c100:  { id: 'c100',  coins: 100,  bonus: 10,  price: 100 },
  c250:  { id: 'c250',  coins: 250,  bonus: 50,  price: 250 },
  c500:  { id: 'c500',  coins: 500,  bonus: 100, price: 500 }
};

// Step 2: confirm package
router.get('/:pkgId', async (req, res) => {
  try{
    const categories = await Book.distinct("category");
              
    const pkg = PACKAGES[req.params.pkgId];
    const user = await User.findById(req.session.user.id).lean();
  if (!pkg) return res.status(404).render('404', { url: req.originalUrl });

  // เก็บแพ็กเกจไว้ใน session ให้ /checkout ใช้ได้
  req.session.selectedPackage = pkg; // <<-- เพิ่มบรรทัดนี้

  // เก็บข้อมูลออเดอร์ (จะใช้หรือไม่ใช้ก็ได้)
  req.session.order = {
    pkgId: pkg.id,
    coins: pkg.coins,
    bonus: pkg.bonus,
    amount: pkg.price
  };

  res.render('coin', {
    pageTitle: 'ยืนยันแพ็กเกจเหรียญ',
    pkg,
    user: req.session.user || null,
    categories: categories.slice(0, 10),
    coins: user.coins
  });
  } catch(err){
    console.log(err)
  }
});


// Step 2.5: proceed to payment
// สร้างออเดอร์
router.post('/checkout', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  // พยายามหาแพ็กเกจจากหลายแหล่งที่เป็นไปได้
  const sess = req.session;
  const pkg =
    sess.selectedPackage ||
    (sess.order && PACKAGES[sess.order.pkgId]) ||
    (req.body && req.body.pkgId && PACKAGES[req.body.pkgId]);

  if (!pkg) {
    // เคส session หลุด/เข้าหน้านี้โดยตรง
    return res.redirect('/topup');
    // หรือจะ res.status(400).send('แพ็กเกจไม่ถูกต้อง') ก็ได้
  }
  const orderId = 'ORD_' + Date.now();
  const order = await Order.create({
    orderId,
    userId: req.session.user._id,
    packageId: pkg.id,
    amountTHB: pkg.price,
    coins: pkg.coins + (pkg.bonus || 0),
    status: 'PENDING',
    gateway: 'manual',
  });

  // เก็บ orderId เผื่อใช้ต่อ, ล้างค่าที่ไม่จำเป็น
  req.session.currentOrderId = orderId;
  req.session.selectedPackage = null;

  res.redirect(`/payment/${order.orderId}`);
});

module.exports = router;
