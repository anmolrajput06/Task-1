
module.exports = function (app, db) {

  const express = require('express');
  const jwt = require('jsonwebtoken');
  const bcrypt = require('bcryptjs');
  
  
  app.post('/login', (req, res) => {
    const { email, password } = req.body;
  
    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
  
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }
  
    // Proceed with database query
    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, results) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        return res.status(500).json({ message: "Internal server error." });
      }
  
      if (results.length > 0) {
        const accessToken = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET);
        return res.json({ accessToken: accessToken });
      } else {
        return res.status(401).json({ message: "Invalid credentials." });
      }
    });
  });

}

