module.exports = function runPython(code) {
    return new Promise((resolve, reject) => {
        // Mock implementation for testing without Python
        console.log("MOCK: Analyzing code:", code.slice(0, 50) + "...");

        // Simple mock analysis logic
        let timeComplexity = "O(1)";
        let spaceComplexity = "O(1)";

        if (code.includes("for") && code.includes("for", code.indexOf("for") + 3)) {
            timeComplexity = "O(n^2)";
        } else if (code.includes("for") || code.includes("while")) {
            timeComplexity = "O(n)";
        }

        if (code.includes("vector") || code.includes("array") || code.includes("malloc") ||
            code.includes("new") || code.includes("alloc")) {
            spaceComplexity = "O(n)";
        }

        // Add delay to simulate processing
        setTimeout(() => {
            resolve(`${timeComplexity},${spaceComplexity}`);
        }, 500);
    });
};
