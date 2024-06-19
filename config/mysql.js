const mysql = require('mysql2');
require('custom-env').env('non-prod');

const pool = mysql.createPool({
  host: process.env.MSHOST,    // 'localhost' or '127.0.0.1' for local server
  user: process.env.MSUSER,
  password: process.env.MSPASSWORD,
  database: process.env.MSDATABASE,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
//   connectTimeout: 10000 // 10 seconds
});

let getConnection = (callback) => {
    pool.getConnection((err, connection) => {
        if (err)
            throw err;
        console.log('Database connected successfully');
      callback(err, connection);
    });
  };

exports.getConnection = getConnection;