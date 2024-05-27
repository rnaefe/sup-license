const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const requestIp = require('request-ip');

const app = express();
const PORT = 3000;

// Configure MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
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

// Import and use routes
const productRoutes = require('./routes/products')(db);
const licenseRoutes = require('./routes/licenses')(db);
const userRoutes = require('./routes/users')(db);
const activationRoutes = require('./routes/activation')(db);

// imported mw
app.use(bodyParser.json());
app.use(requestIp.mw())

app.use('/products', productRoutes);
app.use('/license', licenseRoutes);
app.use('/users', userRoutes);
app.use('/activation', activationRoutes);

app.set('trust proxy', true)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
