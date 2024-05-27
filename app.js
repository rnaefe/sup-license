const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

const requestIp = require('request-ip');

app.use(bodyParser.json());

app.use(requestIp.mw())

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

app.use('/products', productRoutes);
app.use('/license', licenseRoutes);
app.use('/users', userRoutes);
app.use('/activation', activationRoutes);

app.get("/", (req,res) => {
    const ip = req.clientIp;
    res.send(ip)

})


app.set('trust proxy', true)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
