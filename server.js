
  const path = require('path');
  const express = require('express');
  const session = require('express-session');
  const cookieParser = require('cookie-parser');
  const dotenv = require('dotenv');
  const mongoose = require('mongoose');
  const Book = require('./models/Books');
  const User = require("./models/User");

dotenv.config({ path: path.join(__dirname, '.env') });

  const app = express();

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(session({ secret: 'changeme', resave: false, saveUninitialized: false }));
  app.use(express.static("public", {
  maxAge: "7d", // cache 7 วัน
  etag: true
}));

  (async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
      console.log('✅ Mongo connected:', mongoose.connection.name);
    } catch (e) {
      console.error('❌ Mongo error:', e.message);
    }
  })();

app.use((req, res, next) => {
  if (typeof res.locals.categories === 'undefined') res.locals.categories = [];
  if (typeof res.locals.order === 'undefined') res.locals.order = null;
  res.locals.user = req.session.user || null;

  // อ่านจาก cookie
  res.locals.theme = req.cookies.theme || 'light';
  res.locals.fontSize = req.cookies.fontSize || '16px';
  res.locals.fontFamily = req.cookies.fontFamily || 'Arial, sans-serif';

  next();
});

function requireLogin(req, res, next) {
  if (req.session.user) return next();
  req.session.returnTo = req.originalUrl || '/';
  return res.redirect('/login');
}

  const homeRouter    = require('./routes/home');
  const booksRouter   = require('./routes/books');
  const loginRouter   = require('./routes/login');
  const registerRouter= require('./routes/register');
  const paymentRouter = require('./routes/payment');
  const topupRouter = require('./routes/topup');
  const coinRouter = require('./routes/coin');
  const sellRouter = require('./routes/sell');
  const worksRouter = require('./routes/works');
  const readerRouter = require('./routes/reader');
  const resetPasswordRouter = require('./routes/resetpassword');
  const writerRoutes = require("./routes/writer");
  
  app.use("/", resetPasswordRouter);
  
  app.use("/", sellRouter);
  app.use("/", worksRouter);

  app.use("/", homeRouter);
  app.use("/", loginRouter);
  app.use("/", registerRouter);

  app.use('/books', booksRouter);
  app.use('/reader', readerRouter);

  app.use('/payment', requireLogin, paymentRouter);
  app.use('/topup', requireLogin, topupRouter);
  app.use('/coin', requireLogin, coinRouter);

  app.use("/writer", requireLogin, writerRoutes);

  app.use(async(req,res)=>{
    let user = null
    if(req.session.user){
      user = await User.findById(req.session.user.id).lean()
    }
    const books = await Book.find().sort({ rank: 1 });
    const categories = [...new Set(books.map(b => b.category))];
      res.render("404",{ user: req.session.user,
        categories: categories,
        coins: user? user.coins : 0
      })
  })

  app.listen(3000, () => console.log('http://localhost:3000'));
