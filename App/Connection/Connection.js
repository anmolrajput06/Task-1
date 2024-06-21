const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'test'
};

async function connectToDatabase() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log("Connected to MySQL database!");
        return connection;
    } catch (err) {
        console.error("Error connecting to MySQL:", err);
        throw err;
    }
}
connectToDatabase()

module.exports = { connectToDatabase };
