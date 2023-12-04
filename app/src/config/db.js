// const mysql = require("mysql");

// const db = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PSWORD,
//   database: process.env.DB_DATABASE,
// });


// 몽구스 연결
const mongoose = require('mongoose');
const db = mongoose.connect(
    process.env.DB_HOST,
    {
      // useNewUrlPaser: true,
      // useUnifiedTofology: true,
      // useCreateIndex: true,
      // useFindAndModify: false,
    }
  )
  .then(() => console.log('MongoDB conected'))
  .catch((err) => {
    console.log(err);
  });

module.exports = db;