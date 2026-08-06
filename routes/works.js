const express = require('express');
const router = express.Router();
const User = require("../models/User");

router.get("/works", async(req, res) => {
    const user = await User.findById(req.session.user.id).lean();
    const coins = user.coins;
    const totalEp = 0;
    res.render("add", { 
        user,
        coins,
        title: "งานเขียนของฉัน",
        totalEp});
});

router.post("/works", (req, res) => {
    const { count } = req.body;
    // console.log("จำนวนตอน:", count);
    // ส่งข้อมูล JSON 
    res.json({ totalEp: count });
});

module.exports = router;