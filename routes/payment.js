// routes/payment.js
const express = require('express');
const router = express.Router();
const Order = require("../models/Order");
const Book = require("../models/Books");
const User = require("../models/User");

router.get('/:orderId', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  try{
    const categories = await Book.distinct("category");
    const user = await User.findById(req.session.user.id).lean()
    const order = await Order.findOne({
    orderId: req.params.orderId,
    userId: req.session.user._id,
  });

  if (!order) return res.status(404).send('Order not found');


  res.render('payment', {
    pageTitle: 'ชำระเงิน Mebcoin',
    username: req.session?.user?.username || 'guest',
    coins: Number(req.session?.user?.coins ?? 0),
    amount: Number(order.amountTHB) || 0,
    qrImage: '/images/QR.jpg', // your QR image path
    categories: categories.slice(0,10),
    user: req.session.user || null,
    coins: user.coins
  });
  } catch(err){
    console.log(err)
  }
});

module.exports = router;
