# Smriti - AI-Powered Website Chatbot

Smriti is a modern, AI-powered chatbot solution that enables websites to provide intelligent responses based on uploaded documents while maintaining natural conversational abilities. Built with Node.js, React, and PostgreSQL, it leverages Google's Gemini API for advanced language processing.

## 🚀 Features

- 🤖 AI-powered document analysis and response generation
- 📄 Document upload and management system
- 🏷️ Automatic document categorization and tagging
- 🔍 Advanced search capabilities
- 🎯 Customizable AI personalities
- 📊 Response rating and feedback system
- 🔐 Secure authentication and file handling
- 📱 Responsive web interface

## 🛠️ Tech Stack

- **Frontend**: React 19
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **AI**: Google Cloud Gemini API
- **Authentication**: JWT, Passport.js
- **File Processing**: Multer, pdf-parse

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (latest stable version)
- npm or yarn
- Google Cloud Gemini API key

## 🔧 Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/GithubUserUnknown/smriti.git
   cd smriti
   ```

2. **Environment Setup**
   ```bash
   # Backend environment
   cp .env.example backend/.env
   
   # Update .env with your credentials
   # Required variables:
   # - DB_* (Database credentials)
   # - GEMINI_API_KEY
   # - NODE_ENV
   # - PORT
   ```

3. **Install Dependencies**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

4. **Database Setup**
   ```bash
   # Create database
   psql -U postgres
   CREATE DATABASE smritidb;
   
   # Run migrations
   cd backend
   npm run migrate
   ```

## 🚀 Running the Application

### Development Mode
```bash
# Terminal 1 - Backend
cd backend
node app.js

# Terminal 2 - Frontend
cd frontend
npm start
```

### Production Mode
```bash
# Backend
cd backend
NODE_ENV=production npm start

# Frontend
cd frontend
npm run build
```

## 🔒 Security Features

- JWT-based authentication
- Rate limiting
- CORS protection
- Secure file upload handling
- Production logging controls
- Environment-based security configurations

## 📁 Project Structure
```
smriti/
├── backend/
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Custom middleware
│   ├── routes/         # API routes
│   ├── utils/          # Helper functions
│   ├── database/       # Database migrations
│   └── app.js         # Main application file
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── utils/      # Helper functions
│   │   └── App.js      # Root component
│   └── public/         # Static files
└── README.md
```

## 🔍 API Documentation

Key endpoints:
- `POST /api/auth/login` - User authentication
- `POST /api/upload` - Document upload
- `POST /api/chat` - Chat interaction
- `GET /api/documents` - Retrieve documents
- `POST /api/personalities` - Manage AI personalities

## 🐛 Troubleshooting

1. **Connection Issues**
   - Verify PostgreSQL is running
   - Check environment variables
   - Confirm port availability

2. **Upload Problems**
   - Verify upload directory permissions
   - Check file size limits
   - Confirm supported file types

3. **API Key Issues**
   - Validate Gemini API key
   - Check API quota limits
   - Verify environment variables


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@smriti.ai or open an issue in the repository.


