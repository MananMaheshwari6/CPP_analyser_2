// Try to load mongoose, but provide a mock if not available
let mongoose;
let CodeHistory;

// In-memory storage for history when no DB is available
const historyItems = [];

try {
    mongoose = require('mongoose');

    const codeHistorySchema = new mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        code: { type: String, required: true },
        timeComplexity: { type: String },
        spaceComplexity: { type: String },
        createdAt: { type: Date, default: Date.now }
    });

    // Only create the model if mongoose is connected
    CodeHistory = mongoose.models.CodeHistory || mongoose.model('CodeHistory', codeHistorySchema);

} catch (error) {
    console.log('Mongoose not available, using mock model');

    // Create a simple mock if mongoose is not available
    CodeHistory = {
        find: (query = {}) => {
            let results = historyItems;
            if (query.userId) {
                results = historyItems.filter(item => item.userId === query.userId);
            }
            return {
                sort: (sortOpt) => {
                    const sortKey = Object.keys(sortOpt)[0];
                    const sortDir = sortOpt[sortKey];
                    return Promise.resolve(
                        [...results].sort((a, b) => {
                            if (sortDir === -1) {
                                return new Date(b[sortKey]) - new Date(a[sortKey]);
                            } else {
                                return new Date(a[sortKey]) - new Date(b[sortKey]);
                            }
                        })
                    );
                }
            };
        },
        create: (data) => {
            const newItem = {
                ...data,
                _id: Math.random().toString(36).substr(2, 9),
                createdAt: new Date().toISOString()
            };
            historyItems.push(newItem);
            return Promise.resolve(newItem);
        }
    };
}

module.exports = CodeHistory;
