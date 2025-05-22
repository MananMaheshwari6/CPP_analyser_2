const express = require('express');
const router = express.Router();
const { analyzeCode, getHistory } = require('../controllers/complexityController');

// Route to analyze code
router.post('/analyze', analyzeCode);

// Route to fetch history
router.get('/history', getHistory);

module.exports = router;
