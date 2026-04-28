const mongoose = require('mongoose');

// Expense schema design
const expenseSchema = new mongoose.Schema({
    user: {
        type: String, // Using email as user identifier
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

// Export
const expenseModel = mongoose.model('Expense', expenseSchema);
module.exports = expenseModel;