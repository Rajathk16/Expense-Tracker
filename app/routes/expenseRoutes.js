const express = require('express');
const router = express.Router();
const Expense = require('../models/expenseModel');
const authMiddleware = require('../middlewares/authMiddleware');

// Add expense
router.post('/add', authMiddleware, async (req, res) => {
    try {
        const { amount, category, description, date } = req.body;
        const userId = req.user.id;

        const expense = new Expense({
            user: userId,
            amount,
            category,
            description,
            date: date || new Date(),
        });

        await expense.save();
        res.status(201).json({ message: 'Expense added successfully', expense });
    } catch (error) {
        res.status(500).json({ message: 'Error adding expense', error: error.message });
    }
});

// Get all expenses for user
router.get('/all', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const expenses = await Expense.find({ user: userId }).sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expenses', error: error.message });
    }
});

// Get expenses by category
router.get('/category/:category', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { category } = req.params;
        const expenses = await Expense.find({ user: userId, category }).sort({ date: -1 });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expenses', error: error.message });
    }
});

module.exports = router;