document.addEventListener('DOMContentLoaded', function() {
    // Initialize CodeMirror editor
    const codeEditor = CodeMirror(document.getElementById('code-editor'), {
        mode: 'text/x-c++src',
        theme: 'dracula',
        lineNumbers: true,
        indentUnit: 4,
        autoCloseBrackets: true,
        matchBrackets: true,
        lineWrapping: true,
        value: `// Enter your C++ code here
#include <iostream>

int main() {
    std::cout << "Hello World!";
    return 0;
}`
    });

    // DOM elements
    const fileInput = document.getElementById('file-input');
    const fileName = document.getElementById('file-name');
    const analyzeBtn = document.getElementById('analyze-btn');
    const loadingIndicator = document.getElementById('loading-indicator');
    const timeComplexity = document.getElementById('time-complexity');
    const spaceComplexity = document.getElementById('space-complexity');
    const themeToggle = document.getElementById('theme-toggle-input');
    const analyzeNewBtn = document.getElementById('analyze-new-btn');
    const analyzerPage = document.getElementById('analyzer-page');
    const dashboardPage = document.getElementById('dashboard-page');

    // File upload handling
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        fileName.textContent = file.name;

        const reader = new FileReader();
        reader.onload = function(e) {
            codeEditor.setValue(e.target.result);
        };
        reader.readAsText(file);
    });

    // Theme toggle
    themeToggle.addEventListener('change', function() {
        document.body.classList.toggle('light-mode');
    });

    // Analyze button click event
    analyzeBtn.addEventListener('click', function() {
        const code = codeEditor.getValue();
        if (!code.trim()) {
            alert('Please enter or upload C++ code to analyze.');
            return;
        }

        // Show loading indicator
        loadingIndicator.classList.remove('hidden');
        analyzeBtn.disabled = true;

        // Reset result displays
        timeComplexity.textContent = '-';
        spaceComplexity.textContent = '-';

        // Make API request to analyze code
        fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Important for sending cookies with request
            body: JSON.stringify({ code })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Analysis result:', data);
            // Update UI with results
            timeComplexity.textContent = data.timeComplexity;
            spaceComplexity.textContent = data.spaceComplexity;

            // Change color based on complexity
            setComplexityColor(timeComplexity, data.timeComplexity);
            setComplexityColor(spaceComplexity, data.spaceComplexity);
        })
        .catch(error => {
            console.error('Error analyzing code:', error);
            alert('Failed to analyze code. Please try again.');
        })
        .finally(() => {
            // Hide loading indicator
            loadingIndicator.classList.add('hidden');
            analyzeBtn.disabled = false;
        });
    });

    // Navigation between pages
    analyzeNewBtn.addEventListener('click', function() {
        dashboardPage.classList.add('hidden');
        analyzerPage.classList.remove('hidden');
    });

    // Helper function to set color based on complexity
    function setComplexityColor(element, complexity) {
        element.classList.remove('text-success', 'text-warning', 'text-danger');

        if (complexity === 'O(1)' || complexity === 'O(log n)') {
            element.style.color = '#10b981'; // green for good complexity
        } else if (complexity === 'O(n)' || complexity === 'O(n log n)') {
            element.style.color = '#f59e0b'; // yellow for moderate complexity
        } else {
            element.style.color = '#ef4444'; // red for high complexity
        }
    }

    // Resize the editor when window is resized
    window.addEventListener('resize', function() {
        codeEditor.refresh();
    });

    // Function to simulate a login (just for UI demonstration)
    function simulateLogin(username) {
        document.getElementById('username').textContent = username;
        document.getElementById('dashboard-username').textContent = username;
    }

    // Set a default username for demo
    simulateLogin('Guest');
});
