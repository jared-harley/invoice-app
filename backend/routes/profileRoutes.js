// routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET: Fetch Company Profile
router.get('/', async (req, res) => {
    try {
        const profile = await pool.query('SELECT * FROM profiles LIMIT 1');
        res.json(profile.rows[0] || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST/PUT: Save or Update Profile
router.post('/', async (req, res) => {
    const { company_name, tax_id, logo_url, address_line, email } = req.body;
    try {
        // Upsert logic: Update if exists, insert if not
        const query = `
            INSERT INTO profiles (id, company_name, tax_id, logo_url, address_line, email)
            VALUES (1, $1, $2, $3, $4, $5)
            ON CONFLICT (id) DO UPDATE 
            SET company_name = $1, tax_id = $2, logo_url = $3, address_line = $4, email = $5
            RETURNING *;
        `;
        const result = await pool.query(query, [company_name, tax_id, logo_url, address_line, email]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;