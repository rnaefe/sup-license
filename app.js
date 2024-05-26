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


const licenseRoutes = require('./routes/license/licenseHandling.js');

app.use('/license', licenseRoutes(db));

const userRoutes = require('./routes/user/userHandling.js');

app.use('/user', userRoutes(db));




app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
