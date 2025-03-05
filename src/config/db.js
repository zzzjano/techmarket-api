const mysql = require('mysql2');
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const promisePool = pool.promise();

//  Execute SQL query with parameters
const query = async (sql, params = []) => {
  try {
    const [rows, fields] = await promisePool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database Error:', error.message);
    throw error;
  }
};

// Test database connection
const testConnection = async () => {
  try {
    await query('SELECT 1');
    console.log('Database connection established successfully.');
    return true;
  } catch (error) {
    console.error(error);
    console.error('Database connection failed:', error.message);
    return false;
  }
};

module.exports = {
  query,
  testConnection
};
