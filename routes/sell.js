const express = require('express');
const router = express.Router();

router.get("/sell", (req, res) => {
    res.render("sell", { title: "ยอดขาย" });
});

module.exports = router;