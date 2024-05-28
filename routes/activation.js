const express = require('express');
const router = express.Router();

module.exports = (db) => {
    const generateActivationCode = require("../util/utils").generateActivationCode;
    const apiKeyCheckMiddleware = require('../middlewares/apiKeyCheckMiddleware');

    router.get("/reedem/:activationcode", (req, res) => {
        const activationCode = req.params.activationcode;
        const clientIp = req.clientIp;

        // Check if the activation code exists
        db.query("SELECT * FROM activation WHERE activation_code = ?", [activationCode], (err, results) => {
            if (err) {
                return res.status(500).send('Database error.');
            }

            if (results.length === 0) {
                return res.status(404).send('Activation code not found.');
            }

            const productId = results[0].product_id;

            // Check if the product exists
            db.query("SELECT * FROM products WHERE uuid = ?", [productId], (err, productResults) => {
                if (err) {
                    return res.status(500).send('Database error.');
                }

                if (productResults.length === 0) {
                    return res.status(404).send('Product not found.');
                }

                const allowedIps = JSON.parse(productResults[0].allowed_ips);

                // Add client IP to the allowed IPs list if not already present
                if (!allowedIps.includes(clientIp)) {
                    allowedIps.push(clientIp);

                    // Update the product's allowed IPs
                    db.query("UPDATE products SET allowed_ips = ? WHERE uuid = ?", [JSON.stringify(allowedIps), productId], (err, updateResults) => {
                        if (err) {
                            return res.status(500).send('Database error.');
                        }

                        // Delete the activation code after successful IP update
                        db.query("DELETE FROM activation WHERE activation_code = ?", [activationCode], (err, deleteResults) => {
                            if (err) {
                                return res.status(500).send('Database error.');
                            }

                            return res.send({ message: 'IP address added to allowed list and activation code deleted.', addedip: clientIp });
                        });
                    });
                } else {
                    // If IP is already in the allowed list, just delete the activation code
                    db.query("DELETE FROM activation WHERE activation_code = ?", [activationCode], (err, deleteResults) => {
                        if (err) {
                            return res.status(500).send('Database error.');
                        }

                        return res.send({ message: 'IP address is already in the allowed list and activation code deleted.', allowed_ips: allowedIps });
                    });
                }
            });
        });
    });

    // Create activation code
    router.post('/create', apiKeyCheckMiddleware(db, true), (req, res) => {
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

            const productName = results[0].name;
            const activationCode = productName + "-" + generateActivationCode();

            db.query("INSERT INTO activation (activation_code, product_id) VALUES (?, ?)", [activationCode, product_id], (err, results) => {
                if (err) {
                    return res.status(500).send('Database error.');
                }

                return res.send({ message: 'Activation code created successfully.', activation_code: activationCode });
            });
        });
    });

    router.get("/getall", (req, res) => {
        db.query("SELECT * FROM activation", [], (err, results) => {
            if (err) {
                return res.status(500).send('Database error.');
            }

            res.send(results)

        });
    });

    return router;
};
