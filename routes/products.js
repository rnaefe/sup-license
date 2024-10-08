const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

module.exports = (db) => {
    const apiKeyCheckMiddleware = require('../middlewares/apiKeyCheckMiddleware');

    // Create a new product
    router.post('/create', apiKeyCheckMiddleware(db, false), (req, res) => {
        const { name, allowed_ips, blacklisted_ips } = req.body;
        const apiKey = req.headers['api-key'];
        const uuid = uuidv4();

        if (!name || !allowed_ips || !Array.isArray(allowed_ips)) {
            return res.status(400).send('Product name and allowed IPs are required.');
        }

        const allowedIpsString = JSON.stringify(allowed_ips);
        const blacklistedIpsString = JSON.stringify(blacklisted_ips);

        db.query('INSERT INTO products (uuid, name, allowed_ips, blacklisted_ips, api_key) VALUES (?, ?, ?, ?, ?)', 
        [uuid, name, allowedIpsString, blacklistedIpsString, apiKey], (err, results) => {
            if (err) {
                return res.status(500).send('Database error.');
            }

            res.send({ message: 'Product created successfully.', uuid });
        });
    });

    // Get product details
    router.get('/info/:uuid', apiKeyCheckMiddleware(db, true), (req, res) => {
        const { uuid } = req.params;

        db.query('SELECT * FROM products WHERE uuid = ?', [uuid], (err, results) => {
            if (err) {
                return res.status(500).send('Database error.');
            }

            if (results.length === 0) {
                return res.status(404).send('Product not found.');
            }

            const product = results[0];
            product.allowed_ips = JSON.parse(product.allowed_ips);
            product.blacklisted_ips = JSON.parse(product.blacklisted_ips);
            res.send(product);
        });
    });

    router.get('/getall', apiKeyCheckMiddleware(db, false), (req, res) => {
        const apikey = req.headers["api-key"]
        db.query('SELECT * FROM products WHERE api_key = ?', [apikey], (err, results) => {
            if (err) {
                return res.status(500).send('Database error.');
            }

            if (results.length === 0) {
                return res.status(404).send('Product not found.');
            }

            const product = results;
            res.send(product);
        });
    });

    // Delete a product
    router.delete('/delete/:uuid', apiKeyCheckMiddleware(db, true), (req, res) => {
        const { uuid } = req.params;

        db.query('DELETE FROM products WHERE uuid = ?', [uuid], (err, results) => {
            if (err) {
                return res.status(500).send('Database error.');
            }

            if (results.affectedRows === 0) {
                return res.status(404).send('Product not found.');
            }

            res.send({ message: 'Product deleted successfully.' });
        });
    });

    return router;
};
