# CPP Code Analyzer

A web application for analyzing the time and space complexity of C++ code using AST (Abstract Syntax Tree) analysis.

## Features

- Analyze C++ code for time and space complexity
- Code editor with syntax highlighting
- File upload functionality
- Responsive UI with dark mode
- Visual representation of analysis results
- API for code analysis

## Prerequisites

- Node.js (12.x or later)
- Python 3.6+ (with LLVM/Clang for production)

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/CPP_analyser_2.git
   cd CPP_analyser_2
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Install Python dependencies (for production):
   ```
   pip install clang
   ```

## Running the Application

1. Start the server:
   ```
   cd backend
   npm start
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Development Notes

- The backend uses a mock analyzer in development mode. For production, you need to configure the Python environment with LLVM/Clang.
- To use the actual Python analyzer:
  1. Install LLVM/Clang (version 12 or later)
  2. Update the `llvm_path` in `backend/services/analyzeComplexity.py` to point to your LLVM installation
  3. Modify `backend/utils/runPython.js` to use the actual Python script instead of the mock

## API Endpoints

- `POST /api/analyze`: Analyze C++ code
  - Request body: `{ "code": "your cpp code here" }`
  - Response: `{ "timeComplexity": "O(n)", "spaceComplexity": "O(1)" }`

- `GET /api/history`: Get analysis history
  - Response: Array of analysis records

## Project Structure

```
CPP_analyser_2/
├── backend/
│   ├── controllers/
│   │   └── complexityController.js
│   ├── models/
│   │   └── CodeHistory.js
│   ├── routes/
│   │   └── complexityRoutes.js
│   ├── services/
│   │   └── analyzeComplexity.py
│   ├── utils/
│   │   └── runPython.js
│   └── server.js
├── frontend/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── app.js
│   └── index.html
└── README.md
```

## License

This project is licensed under the MIT License.
