const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Configure MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Your MySQL username
  password: '', // Your MySQL password
  database: 'sup-license'
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Failed to connect to the database:', err);
    process.exit(1);
  }
  console.log('Successfully connected to the database.');
});

// Middleware to check allowed apikeys for /license endpoint
const apiKeyCheckMiddleware = require('./middlewares/apiKeyCheckMiddleware')(db);

// Middleware to check allowed IPs for /license endpoint
const ipCheckMiddleware = require('./middlewares/ipCheckMiddleware')(db);

// Create a new product
app.post('/products', (req, res) => {
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
app.get('/products/:uuid', apiKeyCheckMiddleware, (req, res) => {
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

// Delete a product
app.delete('/products/:uuid', apiKeyCheckMiddleware, (req, res) => {
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

// License endpoint that requires IP check
app.post('/license/:uuid', ipCheckMiddleware, (req, res) => {
  // Perform the license check action for the product
  res.send({ success: true, message: 'License check performed successfully.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
