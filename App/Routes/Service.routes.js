module.exports = function (app, db) {

  const express = require('express');
  const authenticateToken = require('../Middleware/Auth');

  function validateService(name, type) {
    if (!name || !type) {
        return false;
    }
    if (type !== 'Normal' && type !== 'VIP') {
        return false;
    }
    return true;
}

function validatePriceOptions(priceOptions) {
    if (!Array.isArray(priceOptions)) {
        return false;
    }
    for (const option of priceOptions) {
        if (!option.duration || !option.price || !option.type) {
            return false;
        }
        if (option.type !== 'Hourly' && option.type !== 'Weekly' && option.type !== 'Monthly') {
            return false;
        }
    }
    return true;
}

// Add service to category
app.post('/category/:categoryId/service', authenticateToken, (req, res) => {
    const categoryId = req.params.categoryId;
    const { name, type, priceOptions } = req.body;

    // Validate service name and type
    if (!validateService(name, type)) {
        return res.status(400).json({ message: "Service name and type are required and type must be either 'Normal' or 'VIP'." });
    }

    // Validate price options
    if (!validatePriceOptions(priceOptions)) {
        return res.status(400).json({ message: "Invalid price options." });
    }

    // Check if the category exists
    const checkCategorySql = 'SELECT * FROM categories WHERE id = ?';
    db.query(checkCategorySql, [categoryId], (err, results) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            return res.status(500).json({ message: "Internal server error." });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Category not found." });
        }

        const sql = 'INSERT INTO services (category_id, name, type) VALUES (?, ?, ?)';
        db.query(sql, [categoryId, name, type], (err, result) => {
            if (err) {
                console.error('Error executing SQL query:', err);
                return res.status(500).json({ message: "Internal server error." });
            }
            const serviceId = result.insertId;
            // Insert price options
            const priceSql = 'INSERT INTO service_price_options (service_id, duration, price, type) VALUES ?';
            const priceValues = priceOptions.map(option => [serviceId, option.duration, option.price, option.type]);
            db.query(priceSql, [priceValues], (err, result) => {
                if (err) {
                    console.error('Error executing SQL query:', err);
                    return res.status(500).json({ message: "Internal server error." });
                }
                res.status(201).send('Service added successfully');
            });
        });
    });
});

// Get services in category
app.get('/category/:categoryId/services', authenticateToken, (req, res) => {
  const categoryId = req.params.categoryId;
  const sql = 'SELECT * FROM services WHERE category_id = ?';
  db.query(sql, [categoryId], (err, results) => {
      if (err) {
          console.error('Error executing SQL query:', err);
          return res.status(500).json({ message: "Internal server error." });
      }
      res.json(results);
  });
});

// Update service
app.put('/category/:categoryId/service/:serviceId', authenticateToken, (req, res) => {
  const serviceId = req.params.serviceId;
  const { name, type, priceOptions } = req.body;

  // Validate service name and type
  if (!validateService(name, type)) {
      return res.status(400).json({ message: "Service name and type are required and type must be either 'Normal' or 'VIP'." });
  }

  // Validate price options
  if (!validatePriceOptions(priceOptions)) {
      return res.status(400).json({ message: "Invalid price options." });
  }

  const updateServiceSql = 'UPDATE services SET name = ?, type = ? WHERE id = ?';
  db.query(updateServiceSql, [name, type, serviceId], (err, result) => {
      if (err) {
          console.error('Error executing SQL query:', err);
          return res.status(500).json({ message: "Internal server error." });
      }
      const deletePriceSql = 'DELETE FROM service_price_options WHERE service_id = ?';
      db.query(deletePriceSql, [serviceId], (err, result) => {
          if (err) {
              console.error('Error executing SQL query:', err);
              return res.status(500).json({ message: "Internal server error." });
          }
          const priceSql = 'INSERT INTO service_price_options (service_id, duration, price, type) VALUES ?';
          const priceValues = priceOptions.map(option => [serviceId, option.duration, option.price, option.type]);
          db.query(priceSql, [priceValues], (err, result) => {
              if (err) {
                  console.error('Error executing SQL query:', err);
                  return res.status(500).json({ message: "Internal server error." });
              }
              res.send('Service updated successfully');
          });
      });
  });
});

// Delete service from category
app.delete('/category/:categoryId/service/:serviceId', authenticateToken, (req, res) => {
  const serviceId = req.params.serviceId;
  const sql = 'DELETE FROM services WHERE id = ?';
  db.query(sql, [serviceId], (err, result) => {
      if (err) {
          console.error('Error executing SQL query:', err);
          return res.status(500).json({ message: "Internal server error." });
      }
      res.send('Service deleted successfully');
  });
});

}
