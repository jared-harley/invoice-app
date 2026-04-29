const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  // Smart SSL: If the host has 'amazonaws.com' in the URL, use SSL. Otherwise, turn it off.
  ssl: process.env.DB_HOST.includes('amazonaws.com') ? { rejectUnauthorized: false } : false
});

module.exports = pool;