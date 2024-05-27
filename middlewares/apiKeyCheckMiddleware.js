const apiKeyCheckMiddleware = (db, product) => (req, res, next) => {
    const apiKey = req.headers['api-key'];
    
    if (!apiKey) {
        return res.status(403).send('API key is required.');
    }

    db.query('SELECT * FROM users WHERE api_key = ? AND active = 1', [apiKey], (err, results) => {
        if (err) {
            return res.status(500).send('Database error.');
        }

        if (results.length === 0) {
            return res.status(403).send('API key is invalid or user is not active.');
        }

        if (product) {
            const uuid = req.params.uuid || req.body.product_id;
            db.query('SELECT api_key FROM products WHERE uuid = ?', [uuid], (err, results) => {
                if (err) {
                    return res.status(500).send('Database error.');
                }

                if (results.length === 0) {
                    return res.status(404).send('Product not found.');
                }

                const productApiKey = results[0].api_key;
                if (apiKey !== productApiKey) {
                    return res.status(403).send('API key does not match product owner.');
                }

                next();
            });
        } else {
            next();
        }
    });
};

module.exports = apiKeyCheckMiddleware;
