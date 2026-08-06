// scripts/fix-chapters.js
require('dotenv').config();
const mongoose = require('mongoose');
const Chapter = require('../models/Chapters');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const OLD_ID = '68c1d6ee924e07e3a53a1d09'; // ค่าใน screenshot
  const NEW_ID = '68c8dc675d650d0c65cbffbe'; // ค่าใน log

  const res = await Chapter.updateMany(
    { book: OLD_ID },                  // ถ้าเก็บเป็น ObjectId ก็ใส่ mongoose.Types.ObjectId(OLD_ID)
    { $set: { book: NEW_ID } }
  );
  console.log('updated:', res.modifiedCount);
  await mongoose.disconnect();
})();
