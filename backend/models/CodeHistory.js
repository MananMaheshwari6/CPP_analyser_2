const mongoose = require('mongoose');

const codeHistorySchema = new mongoose.Schema({
    code: { type: String, required: true },
    timeComplexity: { type: String },
    spaceComplexity: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CodeHistory', codeHistorySchema);
