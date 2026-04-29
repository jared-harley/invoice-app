// index.js
const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const profileRoutes = require('./routes/profileRoutes');
const clientRoutes = require('./routes/clientRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Vite's default port
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json()); // Allows us to parse JSON bodies
app.use('/api/profile', profileRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/invoices', invoiceRoutes);

// Health Check Route
app.get('/api/status', async (req, res) => {
  try {
    const dbStatus = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'Server is running', 
      db_time: dbStatus.rows[0].now 
    });
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});