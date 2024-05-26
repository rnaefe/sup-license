// Middleware to check API key for non-license endpoints
const apiKeyComparisonMiddleware = (db) => (req, res, next) => {
    const apiKey = req.headers['api-key'];
    if (!apiKey) {
      return res.status(403).send('API key is required.');
    }
  
    // Check if the API key belongs to the product owner
    const { uuid } = req.params;
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
  };
  
  module.exports = apiKeyComparisonMiddleware;
  