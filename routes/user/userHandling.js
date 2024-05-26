// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

module.exports = (db) => {
  // Generate API key
  const generateApiKey = (username) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 4;
    let apiKey = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      apiKey += characters[randomIndex];
    }
    return username + "-" + apiKey;
  };

  // Get all users
  router.get('/getall', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
      if (err) {
        return res.status(500).send('Database error.');
      }
      res.send(results);
    });
  });

  // Get user by API key
  router.get('/get/:apiKey', (req, res) => {
    const apiKey = req.params.apiKey;
    db.query('SELECT * FROM users WHERE api_key = ?', [apiKey], (err, results) => {
      if (err) {
        return res.status(500).send('Database error.');
      }
      if (results.length === 0) {
        return res.status(404).send('User not found.');
      }
      res.send(results[0]);
    });
  });

  // Delete user by ID
  router.delete('/delete/:apikey', (req, res) => {
    const userApiKey = req.params.apikey;
    db.query('DELETE FROM users WHERE api_key = ?', [userApiKey], (err, result) => {
      if (err) {
        return res.status(500).send('Database error.');
      }
      if (result.affectedRows === 0) {
        return res.status(404).send('User not found.');
      }
      res.send({ message: 'User deleted successfully.' });
    });
  });

  // Add user
  router.post('/create', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).send('Username, email, and password are required.');
    }

    const apiKey = generateApiKey(username);
    const sql = 'INSERT INTO users (username, email, password, api_key) VALUES (?, ?, ?, ?)';
    const values = [username, email, password, apiKey];

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error adding user:', err);
        res.status(500).send({ message: 'User add action failed.'})
        return;
      }
      res.send({ message: 'User added successfully.', apikey: apiKey})
      console.log('User added successfully.');
    });;
  });

  return router;
};
