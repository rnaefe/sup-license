const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

module.exports = (db) => {
    // Create a new user
    router.post('/create', async (req, res) => {
        const { username, email, password } = req.body;
        const apiKey = username + "-" + uuidv4().slice(0, 6).toUpperCase();

        if (!email || !password) {
            return res.status(400).send('Email and password are required.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query('INSERT INTO users (username, email, password, api_key, active) VALUES (?, ?, ?, ?, ?)', [username, email, hashedPassword, apiKey, true], (err, results) => {
            if (err) {
                throw err
                return res.status(500).send('Database error.');
            }

            res.send({ message: 'User registered successfully. Api key: ' + apiKey, api_key: apiKey });
        });
    });

    // User login
    router.post('/login', (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send('Email and password are required.');
        }

        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                return res.status(500).send('Database error.');
            }

            if (results.length === 0) {
                return res.status(404).send('User not found.');
            }

            const user = results[0];

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(403).send('Invalid credentials.');
            }

            res.send({ message: 'Login successful.', api_key: user.api_key });
        });
    });

    router.get('/getall', (req, res) => {
        db.query('SELECT * FROM users', [], async (err, results) => {
            if (err) {
                return res.status(500).send('Database error.');
            }

            if (results.length === 0) {
                return res.status(404).send('User not found.');
            }

            res.send(results);
        });
    });

    // Get user info
    router.get('/info/:apikey', (req, res) => {
        const apiKey = req.params['apikey'];
        
        if (!apiKey) {
            return res.status(403).send('API key is required.');
        }

        db.query('SELECT * FROM users WHERE api_key = ? AND active = 1', [apiKey], (err, results) => {
            if (err) {
                return res.status(500).send('Database error.');
            }

            if (results.length === 0) {
                return res.status(404).send('User not found or inactive.');
            }

            const user = results[0];
            db.query('SELECT COUNT(*) AS script_count FROM products WHERE api_key = ?', [apiKey], (err, productResults) => {
                if (err) {
                    return res.status(500).send('Database error.');
                }

                const userInfo = {
                    email: user.email,
                    api_key: user.api_key,
                    active: user.active,
                    registration_date: user.registration_date,
                    script_count: productResults[0].script_count
                };

                res.send(userInfo);
            });
        });
    });

    return router;
};
