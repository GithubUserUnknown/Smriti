# Smriti (An easy to setup chatbot for websites)

This project is an AI chatbot for websites that want the chatbot to be able to answer questions about their company or products with the help of uploaded documents, and also provide conversational features. It features a chatbot interface that can answer questions about the uploaded documents, and also provide conversational features.

## Features

- Document upload and storage with AI-powered analysis
- AI chatbot for document queries
- Document categorization and tagging
- Search functionality
- PostgreSQL database integration
- Secure file handling

## Prerequisites

Before running this project, make sure you have:

1. Node.js installed (v16 or higher)
2. PostgreSQL installed and running
3. npm or yarn package manager
4. Google Cloud Gemini API key

## Installation and Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

This will install the following required packages from package.json:
- express
- pg (PostgreSQL client)
- dotenv
- cors
- multer
- @google-cloud/translate
- body-parser
- pdf-parse
- @huggingface/inference
- compromise

3. Create a `.env` file in the backend directory:
```env
# Database Configuration
DB_USER=postgres
DB_HOST=localhost
DB_NAME=smritidbp
DB_PASSWORD=your_password
DB_PORT=5432

# Server Configuration
PORT=5000

# API Keys
GEMINI_API_KEY=your_gemini_api_key

# Other Configuration
UPLOAD_DIR=./uploads
```

4. Create the uploads directory:
```bash
mkdir uploads
```

### 3. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

This will install React and other required frontend packages.

### 4. Database Setup

1. Create a PostgreSQL database named `smritidbp`:
```sql
CREATE DATABASE smritidbp;
```

2. Create the required tables:
```sql
-- Files table for document storage
CREATE TABLE IF NOT EXISTS files (
    id SERIAL PRIMARY KEY,
    description TEXT,
    tags TEXT[],
    category VARCHAR(100),
    filename VARCHAR(255),
    filepath VARCHAR(255),
    upload_date TIMESTAMP DEFAULT NOW(),
    parsed_content TEXT
);

-- Personalities table for AI personality configurations
CREATE TABLE IF NOT EXISTS personalities (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100),
    name VARCHAR(100),
    gender VARCHAR(50),
    age INTEGER,
    behavior_prompt TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Query history table for tracking AI interactions
CREATE TABLE IF NOT EXISTS query_history (
    id SERIAL PRIMARY KEY,
    query TEXT,
    response TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Ratings table for response feedback
CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    query TEXT,
    response TEXT,
    rating INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
```

3. Run the database migration:
```bash
cd backend
node database/migrate.js
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```
The backend server will start on http://localhost:5000

2. In a new terminal, start the frontend development server:
```bash
cd frontend
npm start
```
The frontend application will open in your browser at http://localhost:3000

## Common Issues and Troubleshooting

1. If you get a module not found error:
   - Make sure you've run `npm install` in both frontend and backend directories
   - Check if all dependencies are properly listed in package.json

2. Database connection issues:
   - Verify PostgreSQL is running
   - Check your database credentials in .env file
   - Ensure the database and tables are created properly

3. API key issues:
   - Verify your Gemini API key is valid
   - Check if the API key is properly set in the .env file

## Project Structure

```
├── backend/
│   ├── database/
│   │   └── migrate.js
│   ├── routes/
│   │   ├── uploadRoutes.js
│   │   └── personalityRoutes.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.js
│   └── package.json
└── README.md
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

