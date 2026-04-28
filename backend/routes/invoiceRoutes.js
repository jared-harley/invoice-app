const express = require('express');
const router = express.Router();
const pool = require('../db'); // Adjust path if your db.js is located elsewhere
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const path = require('path');
const nodemailer = require('nodemailer');

// --- EMAIL SINGLETON SETUP ---
let transporter;
const setupEmail = async () => {
    try {
        let testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: { user: testAccount.user, pass: testAccount.pass },
        });
        console.log("✅ Email system ready (Ethereal)");
    } catch (err) {
        console.error("❌ Email setup failed:", err);
    }
};
setupEmail();

// --- INVOICE HEADER ROUTES ---

// GET all invoices
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM invoices ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Create a new invoice
router.post('/', async (req, res) => {
    const { client_id, issue_date, due_date, status } = req.body;
    try {
        const profileRes = await pool.query('SELECT invoice_prefix, next_invoice_number FROM profiles WHERE id = 1');
        
        let prefix = 'INV-';
        let nextNum = 1;

        if (profileRes.rows.length > 0) {
            prefix = profileRes.rows[0].invoice_prefix || 'INV-';
            nextNum = profileRes.rows[0].next_invoice_number || 1;
            await pool.query('UPDATE profiles SET next_invoice_number = next_invoice_number + 1 WHERE id = 1');
        } else {
            await pool.query("INSERT INTO profiles (id, invoice_prefix, next_invoice_number) VALUES (1, 'INV-', 2)");
        }
        
        const invoiceNumber = `${prefix}${String(nextNum).padStart(4, '0')}`;

        const newInvoice = await pool.query(
            'INSERT INTO invoices (invoice_number, client_id, issue_date, due_date, status, total_amount) VALUES ($1, $2, $3, $4, $5, 0.00) RETURNING *',
            [invoiceNumber, client_id, issue_date, due_date, status || 'Draft']
        );
        res.json(newInvoice.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT: Update an invoice header
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { client_id, issue_date, due_date, status } = req.body;
    try {
        await pool.query(
            'UPDATE invoices SET client_id = $1, issue_date = $2, due_date = $3, status = $4 WHERE id = $5',
            [client_id, issue_date, due_date, status, id]
        );
        res.json({ message: "Invoice updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- INVOICE ITEMS ROUTES ---

// GET items for a specific invoice
router.get('/:id/items', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY id ASC', [id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Add a new line item
router.post('/:id/items', async (req, res) => {
    const { id } = req.params;
    const { description, quantity, unit_price } = req.body;
    try {
        const newItem = await pool.query(
            'INSERT INTO invoice_items (invoice_id, description, quantity, unit_price) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, description, quantity, unit_price]
        );
        res.json(newItem.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT: Update a line item (Handles DevExtreme Partial Updates)
router.put('/:id/items/:itemId', async (req, res) => {
    const { itemId } = req.params;
    const description = req.body.description !== undefined ? req.body.description : null;
    const quantity = req.body.quantity !== undefined ? req.body.quantity : null;
    const unit_price = req.body.unit_price !== undefined ? req.body.unit_price : null;

    try {
        await pool.query(`
            UPDATE invoice_items 
            SET description = COALESCE($1, description), 
                quantity = COALESCE($2, quantity), 
                unit_price = COALESCE($3, unit_price)
            WHERE id = $4
        `, [description, quantity, unit_price, itemId]);
        res.json({ message: 'Item updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE: Remove a line item
router.delete('/:id/items/:itemId', async (req, res) => {
    const { itemId } = req.params;
    try {
        await pool.query('DELETE FROM invoice_items WHERE id = $1', [itemId]);
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- PDF AND EMAIL ROUTES ---

// GET: Download PDF directly
router.get('/:id/pdf', async (req, res) => {
    const { id } = req.params;
    try {
        const profileRes = await pool.query('SELECT * FROM profiles WHERE id = 1');
        const invoiceRes = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
        if (invoiceRes.rows.length === 0) return res.status(404).send('Invoice not found');
        
        const clientRes = await pool.query('SELECT * FROM clients WHERE id = $1', [invoiceRes.rows[0].client_id]);
        const itemsRes = await pool.query('SELECT * FROM invoice_items WHERE invoice_id = $1', [id]);

        const templatePath = path.join(__dirname, '../templates/invoice.ejs');
        const html = await ejs.renderFile(templatePath, {
            profile: profileRes.rows[0] || { company_name: 'Company', address_line: '', email: '' },
            invoice: invoiceRes.rows[0],
            client: clientRes.rows[0] || { name: 'Client', billing_address: '' },
            items: itemsRes.rows
        });

        const browser = await puppeteer.launch({ headless: "shell" });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' } });
        await browser.close();

        res.contentType("application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=${invoiceRes.rows[0].invoice_number}.pdf`);
        res.send(pdfBuffer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});

// POST: Email PDF
router.post('/:id/email', async (req, res) => {
    const { id } = req.params;
    const { target_email } = req.body || {}; 

    try {
        const invoiceRes = await pool.query('SELECT * FROM invoices WHERE id = $1', [id]);
        if (invoiceRes.rows.length === 0) return res.status(404).send('Invoice not found');
        
        const profileRes = await pool.query('SELECT * FROM profiles WHERE id = 1');
        const clientRes = await pool.query('SELECT * FROM clients WHERE id = $1', [invoiceRes.rows[0].client_id]);
        const itemsRes = await pool.query('SELECT * FROM invoice_items WHERE invoice_id = $1', [id]);

        const templatePath = path.join(__dirname, '../templates/invoice.ejs');
        const html = await ejs.renderFile(templatePath, {
            profile: profileRes.rows[0] || { company_name: 'Company', address_line: '', email: '' },
            invoice: invoiceRes.rows[0],
            client: clientRes.rows[0] || { name: 'Client', billing_address: '' },
            items: itemsRes.rows
        });

        const browser = await puppeteer.launch({ headless: "shell" });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();

        if (!transporter) throw new Error("Email system not ready yet");

        const info = await transporter.sendMail({
            from: `"${profileRes.rows[0]?.company_name || 'Invoicing App'}" <billing@example.com>`,
            to: target_email || 'client@example.com',
            subject: `Invoice ${invoiceRes.rows[0].invoice_number}`,
            text: `Please find attached your invoice.`,
            attachments: [{ filename: `${invoiceRes.rows[0].invoice_number}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }]
        });
        
        const previewUrl = nodemailer.getTestMessageUrl(info);
        res.json({ message: 'Success', preview_url: previewUrl });

    } catch (err) {
        console.error(err);
        if (!res.headersSent) res.status(500).json({ error: err.message });
    }
});

module.exports = router;