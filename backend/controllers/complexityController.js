const CodeHistory = require('../models/CodeHistory');
const runPython = require('../utils/runPython');

// In-memory database fallback
const inMemoryDb = {
    codeHistory: []
};

exports.analyzeCode = async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Code is required" });

    try {
        const output = await runPython(code);
        const [time, space] = output.trim().split(',');

        try {
            // Save with user ID if authenticated
            const userId = req.userId || 'guest';
            const historyData = {
                code,
                timeComplexity: time,
                spaceComplexity: space,
                userId
            };

            // Try to save to database
            await CodeHistory.create(historyData);
            console.log("Saved analysis to history");
        } catch (dbError) {
            console.error("Failed to save analysis history:", dbError.message);
        }

        res.json({ timeComplexity: time, spaceComplexity: space });
    } catch (err) {
        console.error("Analysis error:", err);
        res.status(500).json({ error: "Failed to analyze code", details: err.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        // Get user-specific history if authenticated
        const userId = req.userId || null;

        let query = {};
        if (userId) {
            // If authenticated, get user's history
            query = { userId };
        } else {
            // If not authenticated, only get guest entries (for demo purposes)
            // In a real app, you might not show any history for unauthenticated users
            query = { userId: 'guest' };
        }

        const history = await CodeHistory.find(query).sort({ createdAt: -1 });
        res.json(history);
    } catch (err) {
        console.error("Failed to fetch history:", err.message);
        res.status(500).json({ error: "Failed to fetch history" });
    }
};
