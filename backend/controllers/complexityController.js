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
            // Try to save to MongoDB first
            const entry = new CodeHistory({ code, timeComplexity: time, spaceComplexity: space });
            await entry.save();
            console.log("Saved to MongoDB");
        } catch (dbError) {
            // Fall back to in-memory storage if MongoDB fails
            console.log("MongoDB save failed, using in-memory storage:", dbError.message);
            inMemoryDb.codeHistory.push({
                code,
                timeComplexity: time,
                spaceComplexity: space,
                createdAt: new Date().toISOString()
            });
        }

        res.json({ timeComplexity: time, spaceComplexity: space });
    } catch (err) {
        console.error("Analysis error:", err);
        res.status(500).json({ error: "Failed to analyze code", details: err.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        // Try to get history from MongoDB first
        const history = await CodeHistory.find().sort({ createdAt: -1 });
        res.json(history);
    } catch (err) {
        console.log("MongoDB query failed, using in-memory data:", err.message);
        // Fall back to in-memory data if MongoDB fails
        res.json(inMemoryDb.codeHistory.sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)));
    }
};
