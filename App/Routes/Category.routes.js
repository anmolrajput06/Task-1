module.exports = function (app, db) {
    const express = require('express');
    const authenticateToken = require('../Middleware/Auth');


    function validateCategoryName(name) {
        if (!name) {
            return false;
        }
        return true;
    }

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




    // Create category
    app.post('/category', authenticateToken, (req, res) => {
        const { name } = req.body;

        // Validate category name
        if (!validateCategoryName(name)) {
            return res.status(400).json({ message: "Category name is required." });
        }

        const sql = 'INSERT INTO categories (name) VALUES (?)';
        db.query(sql, [name], (err, result) => {
            if (err) {
                console.error('Error executing SQL query:', err);
                return res.status(500).json({ message: "Internal server error." });
            }
            const categoryId = result.insertId; // Get the ID of the newly created category
            res.status(201).json({ message: 'Category created successfully', categoryId: categoryId });
        });
    });

    // Get all categories
    app.get('/categories', authenticateToken, (req, res) => {
        const sql = 'SELECT * FROM categories';
        db.query(sql, (err, results) => {
            if (err) {
                console.error('Error executing SQL query:', err);
                return res.status(500).json({ message: "Internal server error." });
            }
            res.json(results);
        });
    });

    // Update category
    app.put('/category/:categoryId', authenticateToken, (req, res) => {
        const categoryId = req.params.categoryId;
        const { name } = req.body;

        // Validate category name
        if (!validateCategoryName(name)) {
            return res.status(400).json({ message: "Category name is required." });
        }

        const sql = 'UPDATE categories SET name = ? WHERE id = ?';
        db.query(sql, [name, categoryId], (err, result) => {
            if (err) {
                console.error('Error executing SQL query:', err);
                return res.status(500).json({ message: "Internal server error." });
            }
            res.send('Category updated successfully');
        });
    });

    // Delete empty category
    app.delete('/category/:categoryId', authenticateToken, (req, res) => {
        const categoryId = req.params.categoryId;
        const sql = 'DELETE FROM categories WHERE id = ? AND id NOT IN (SELECT DISTINCT category_id FROM services)';
        db.query(sql, [categoryId], (err, result) => {
            if (err) {
                console.error('Error executing SQL query:', err);
                return res.status(500).json({ message: "Internal server error." });
            }
            res.send('Category deleted successfully');
        });
    });

}


