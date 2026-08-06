// scripts/updateChapters.js
require('dotenv').config();
const mongoose = require('mongoose');
const Chapter = require('./models/Chapters');

async function run() {
      try {
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
        console.log('✅ Mongo connected:', mongoose.connection.name);
      } catch (e) {
        console.error('❌ Mongo error:', process.env.MONGO_URI);
      };

  // ใส่ค่า default ให้ทุก doc ที่ยังไม่มี status
  const res = await Chapter.updateMany(
    { status: { $exists: false } },  // เฉพาะเอกสารที่ยังไม่มี
    { $set: { status: "published" } }
  );

  console.log(`✅ Updated ${res.modifiedCount} chapters`);
  await mongoose.disconnect();
}

run().catch(err => console.error(err));
