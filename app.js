const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const requestIp = require('request-ip');
const cors = require('cors');
const app = express();
const PORT = 3000;
const path = require("path")

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
app.use(cors())
app.use(bodyParser.json());
app.use(requestIp.mw())

app.use(express.static(__dirname + '/public'));

app.use('/products', productRoutes);
app.use('/license', licenseRoutes);
app.use('/users', userRoutes);
app.use('/activation', activationRoutes);

app.set('trust proxy', true)

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
