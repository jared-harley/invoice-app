const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET: All clients
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clients ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Add new client
router.post('/', async (req, res) => {
    const { name, billing_address, website } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO clients (name, billing_address, website) VALUES ($1, $2, $3) RETURNING *',
            [name, billing_address, website]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT: Update existing client
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, billing_address, website } = req.body;
    try {
        await pool.query(
            'UPDATE clients SET name = $1, billing_address = $2, website = $3 WHERE id = $4',
            [name, billing_address, website, id]
        );
        res.json({ message: "Client updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE: Remove a client
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM clients WHERE id = $1', [id]);
        res.json({ message: "Client deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;