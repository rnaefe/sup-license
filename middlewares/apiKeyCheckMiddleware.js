// Middleware to check API key for non-license endpoints
const apiKeyComparisonMiddleware = (db, product) => (req, res, next) => {
  const apiKey = req.headers['api-key'];
  if (!apiKey) {
      return res.status(403).send('API key is required.');
  }

  if (product) {
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
    
          // Check if API key matches product owner's API key
          if (apiKey !== productApiKey) {
              return res.status(403).send('API key does not match product owner.');
          }

          // Check if the user associated with the API key is active
          db.query('SELECT active FROM users WHERE api_key = ?', [apiKey], (err, userResults) => {
              if (err) {
                  return res.status(500).send('Database error.');
              }
        
              if (userResults.length === 0) {
                  return res.status(404).send('User not found.');
              }
        
              const isActive = userResults[0].active;
              if (!isActive) {
                  return res.status(403).send('License expired.');
              }
        
              next();
          });
      });
  } else {
      // Check if the user associated with the API key is active
      db.query('SELECT active FROM users WHERE api_key = ?', [apiKey], (err, userResults) => {
          if (err) {
              return res.status(500).send('Database error.');
          }
    
          if (userResults.length === 0) {
              return res.status(404).send('User not found.');
          }
    
          const isActive = userResults[0].active;
          if (!isActive) {
              return res.status(403).send('License expired.');
          }
    
          next();
      });
  }
};

module.exports = apiKeyComparisonMiddleware;
