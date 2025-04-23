# Smriti - AI Generator  
**Elevate Your Website with Next-Gen AI in Under 60 Seconds**

Smriti AI Generator allows websites to integrate an intelligent AI chatbot that can answer questions based on uploaded documents—ideal for customer support, product info, and internal knowledge bases.

🔗 **Live Demo:** [https://smriti-ai-generator.onrender.com/](Smriti - AI Generator)

---

## ✨ Features

- 🧠 AI chatbot trained on your documents  
- 📄 PDF document parsing and storage  
- 🔍 Full-text search and categorization  
- 🏷️ Tagging and smart metadata  
- 🗃️ PostgreSQL integration  
- 🔐 Secure file handling and scalable backend

---

## 📦 Prerequisites

- Node.js v16+  
- PostgreSQL  
- npm or Yarn  
- Google Cloud Gemini API key

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <project-directory>
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

#### 🔧 Configure Environment

Create a `.env` file in the `backend/` directory:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=smritidbp
DB_PASSWORD=your_password
DB_PORT=5432
PORT=5000
GEMINI_API_KEY=your_gemini_api_key
UPLOAD_DIR=./uploads
```

Create uploads directory:

```bash
mkdir uploads
```

#### 🛠️ Database Setup

Start PostgreSQL and run the following to create the database:

```sql
CREATE DATABASE smritidbp;
```

Create required tables:

```sql
-- Files
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

-- Personalities
CREATE TABLE IF NOT EXISTS personalities (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100),
    name VARCHAR(100),
    gender VARCHAR(50),
    age INTEGER,
    behavior_prompt TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Query History
CREATE TABLE IF NOT EXISTS query_history (
    id SERIAL PRIMARY KEY,
    query TEXT,
    response TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Ratings
CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    query TEXT,
    response TEXT,
    rating INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
```

Run migration script:

```bash
node database/migrate.js
```

Start backend server:

```bash
node app.js
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Visit the app at: [https://smriti-ai-generator.onrender.com/](Live Demo)

---

## 📁 Project Structure

```
smriti-ai-generator/
├── backend/
│   ├── database/
│   ├── routes/
│   ├── uploads/
│   ├── app.js
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.js
└── README.md
```

---

## 🧩 Key Dependencies

### Backend

- `express` – Web server framework  
- `pg` – PostgreSQL client  
- `multer` – File upload handler  
- `dotenv` – Manage environment variables  
- `cors` – Cross-origin requests  
- `pdf-parse` – PDF parsing  
- `@huggingface/inference` – AI model API  
- `@google-cloud/translate` – Translate API  
- `compromise` – Lightweight NLP library

### Frontend

- `React` – UI library  
- `axios` – HTTP client  
- `react-router-dom` – Routing  
- CSS framework (e.g., Tailwind or Bootstrap)

---

## 🧪 Troubleshooting

- **Missing module errors:**  
  Run `npm install` in both frontend and backend folders.

- **Database issues:**  
  Make sure PostgreSQL is running and `.env` values are correct.

- **File upload not working:**  
  Ensure `uploads/` exists and `multer` is installed.

- **CORS errors:**  
  Verify frontend URL is added to CORS config in backend.

---

## ☁️ Deployment

This app is deployed and tested on **Render**. For deploying your own version, consult the [Render documentation](https://render.com/docs) and make sure your `.env` contains correct production credentials and URLs.

---

## 📜 License

This project is licensed under the MIT License. See the `LICENSE` file for details.