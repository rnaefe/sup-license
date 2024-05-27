const express = require('express');
const router = express.Router();

module.exports = (db) => {
    const ipCheckMiddleware = require('../middlewares/ipCheckMiddleware')(db);
    const apiKeyCheckMiddleware = require('../middlewares/apiKeyCheckMiddleware');

        // License endpoint that requires IP check
    router.post('/:uuid', ipCheckMiddleware, (req, res) => {
        // Perform the license check action for the product
        res.send({ success: true, message: 'License check performed successfully.' });
    });

    // Create activation code
    router.post('/create', apiKeyCheckMiddleware(db, true), (req, res) => {
        const activationCode = generateActivationCode();
        const { product_id } = req.body;

        if (!product_id) {
            return res.status(400).send('Product ID is required.');
        }

        db.query("SELECT * FROM products WHERE uuid = ?", [product_id], (err, results) => {
            if (err) {
                return res.status(500).send('Database error.');
            }

            if (results.length === 0) {
                return res.status(404).send('Product not found.');
            }

            db.query("INSERT INTO activation (activation_code, product_id) VALUES (?, ?)", [activationCode, product_id], (err, results) => {
                if (err) {
                    return res.status(500).send('Database error.');
                }

                return res.send({ message: 'Activation code created successfully.', activation_code: activationCode });
            });
        });
    });

    return router;
};
