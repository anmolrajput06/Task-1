// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
require('dotenv').config(); // Load environment variables from .env file


const app = express();
const PORT = process.env.PORT || 8000;

app.use(bodyParser.json());



// MySQL database connection
const db = mysql.createConnection({
    host: process.env.HOST,
    port: process.env.PORT1,
    user: process.env.USER,
    password: '',
    database: process.env.DATABASE
});

// Connect to the database
db.connect(err => {
    if (err) {
        console.error('Database connection failed: ' + err.message);
        return;
    }
    console.log('Connected to the database');
});






require('./App/Routes/Auth.routes')(app,db);
require('./App/Routes/Category.routes')(app,db);
require('./App/Routes/Service.routes')(app,db);



// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
