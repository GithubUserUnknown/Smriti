const express = require('express');
const multer = require('multer');
const axios = require('axios'); // For making HTTP requests to the Gemini API
const pool = require('../dbConfig'); // Import database config
const router = express.Router();


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage: storage });

const fs = require('fs');
const pdfParse = require('pdf-parse');

router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const filePath = req.file.path;
        let parsedContent = '';

        // Check file type and parse content accordingly
        if (req.file.mimetype === 'application/pdf') {
            const pdfData = fs.readFileSync(filePath);
            const parsedPdf = await pdfParse(pdfData);
            parsedContent = parsedPdf.text; // Extract text from PDF
        } else if (req.file.mimetype === 'text/plain') {
            parsedContent = fs.readFileSync(filePath, 'utf8'); // Read text file content
        } else {
            parsedContent = 'Unsupported file type for parsing'; // Handle unsupported formats
        }

        const metadata = {
            description: req.body.description,
            tags: req.body.tags ? req.body.tags.split(',') : [],
            category: req.body.category,
            filename: req.file.filename,
            filepath: req.file.path,
            uploadDate: new Date(),
            parsedContent,
        };

        const query = `
            INSERT INTO files (description, tags, category, filename, filepath, upload_date, parsed_content)
            VALUES ($1, $2, $3, $4, $5, NOW(), $6)
        `;

        await pool.query(query, [
            metadata.description,
            metadata.tags,
            metadata.category,
            metadata.filename,
            metadata.filepath,
            metadata.parsedContent,
        ]);

        res.status(200).json({ message: 'File uploaded and parsed successfully!', metadata });
    } catch (error) {
        console.error('Failed to upload or parse file:', error.message);
        res.status(500).json({ message: 'Failed to upload or parse file!', error: error.message });
    }
});


const nlp = require('compromise');

router.post('/ai-query', async (req, res) => {
  // Destructure fields; persistentCompanyContext is optional (from frontend if already active)
  const {
    query: userQuery,
    userId, // must be included (from frontend or auth token)
    name = 'Smriti',
    gender = 'female',
    age = 23,
    behaviorPrompt = '',
    conversationHistory: clientHistory = '', // A conversation summary string
    persistentCompanyContext = '' // Persistent company data carried over from previous queries
  } = req.body;

  try {
    // Fetch available tags from the database
    const tagsResult = await pool.query('SELECT tags FROM files WHERE tags IS NOT NULL');
    const allTags = tagsResult.rows.flatMap(row => row.tags);

    const conversationContext = clientHistory.trim();

    // Check if current query matches any company tag using userQuery
    const matchesTags = allTags.some(tag => userQuery.toLowerCase().includes(tag.toLowerCase()));
  
    // Build personality instruction text
    const personalityInstruction = `
      Please respond as if you are a ${age}-year-old ${gender} named ${name}.
      ${behaviorPrompt || "You are cheerful, bright, and a bit flirty. Your tone should be warm, playful, and friendly."}
    `.trim();

    let prompt = '';
    let companyDataUsed = false;
    let companyContext = '';

    // If the query matches tags or if persistent company context is already provided,
    // we include the company data.
    if (matchesTags || persistentCompanyContext) {
      if (matchesTags) {
        // Fetch company data (parsed content) from the database
        const contentResult = await pool.query('SELECT parsed_content FROM files');
        const parsedContents = contentResult.rows
          .map(row => row.parsed_content)
          .filter(Boolean);
        companyContext = parsedContents.join('\n\n');
      } else {
        // Otherwise, keep the previously persisted company data.
        companyContext = persistentCompanyContext;
      }
      companyDataUsed = true;

      if (conversationContext.length) {
        prompt = `${personalityInstruction}\n\nConversation so far:\n${conversationContext}\n\nUse the context to generate a response:\n${companyContext}\n\nUser: ${userQuery}`;
      } else {
        prompt = `${personalityInstruction}\nUse this company data to generate a response:\n${companyContext}\n\nUser: ${userQuery}`;
      }
    } else {
      // If no company context is involved, build the prompt normally.
      if (conversationContext.length) {
        prompt = `${personalityInstruction}\n\nConversation so far:\n${conversationContext}\n\nUser: ${userQuery}`;
      } else {
        prompt = `${personalityInstruction}\nUser: ${userQuery}`;
      }
    }

    // For debugging: log the full prompt
    console.log("DEBUG: Sending the following prompt to Gemini API:");
    console.log(prompt);

    // Call Gemini API using the constructed prompt
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          { parts: [{ text: prompt }] }
        ]
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const generatedResponse = response.data.candidates[0].content.parts[0].text.trim();
    if (!generatedResponse) {
      throw new Error('Unexpected API response structure');
    }
    res.status(200).json({
      response: generatedResponse,
      companyDataUsed,
      companyContext // including it so client can persist for subsequent queries
    });

    // Log the query history with the userQuery and generatedResponse
    await pool.query(
      `INSERT INTO query_history (query, response) VALUES ($1, $2)`,
      [userQuery, generatedResponse]
    );
  } catch (error) {
    console.error('AI query processing failed:', error.message);
    res.status(500).json({ message: 'Failed to process AI query!', error: error.message });
  }
});


// router.post('/ai-query', async (req, res) => {
//     const { query, language } = req.body; // User's preferred language

//     try {

        
//         // Fetch all parsed content from the database
//         const result = await pool.query('SELECT parsed_content FROM files');
//         const parsedContents = result.rows.map(row => row.parsed_content).filter(Boolean);
//         const context = parsedContents.join('\n\n'); // Combine parsed data into one string

//         const tagsResult = await pool.query('SELECT tags FROM files WHERE tags IS NOT NULL');
//         const allTags = tagsResult.rows.flatMap(row => row.tags); // Flatten tags array

//         // Check if query matches any tags
//         const matchesTags = allTags.some(tag => nlp(query).has(tag));

//         // Decide whether to use company data or handle as a general query
//         let prompt = '';
//         if (query.includes('product') || query.includes('company') || query.includes('info')) {
//             prompt = `Use this company data to generate a response:\n${context}\nQuery: ${query}`;
//         } else {
//             if (matchesTags) {
//                 // Fetch parsed content if query matches tags
//                 const contentResult = await pool.query('SELECT parsed_content FROM files');
//                 const parsedContents = contentResult.rows.map(row => row.parsed_content).filter(Boolean);
//                 const context = parsedContents.join('\n\n');
//                 prompt = `Use this company data to generate a response:\n${context}\nQuery: ${query}`;
//             } else {
//                 prompt = `User Query: ${query}`;
//             }
//         }

//         // Send request to Gemini API
//         const response = await axios.post(
//             'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=GEMINI_API_KEY',
//             {
//                 contents: [
//                     {
//                         parts: [{ text: prompt }]
//                     }
//                 ],
//             },
//             {
//                 headers: { 'Content-Type': 'application/json' }, // Ensure headers match
//             }
//         );

//         // Extract and validate the response content
//         if (
//             response.data &&
//             response.data.candidates &&
//             response.data.candidates[0] &&
//             response.data.candidates[0].content &&
//             response.data.candidates[0].content.parts &&
//             response.data.candidates[0].content.parts[0] &&
//             response.data.candidates[0].content.parts[0].text
//         ) {
//             const generatedResponse = response.data.candidates[0].content.parts[0].text.trim();
//             res.status(200).json({ response: generatedResponse });
//         } else {
//             throw new Error('Unexpected API response structure');
//         }
//     } catch (error) {
//         console.error('AI query processing failed:', error.message);
//         res.status(500).json({ message: 'Failed to process AI query!', error: error.message });
//     }
// });

// Route for submitting ratings
router.post('/submit-rating', async (req, res) => {
    const { query, response, rating } = req.body;

    try {
        const queryText = `
            INSERT INTO ratings (query, response, rating, created_at)
            VALUES ($1, $2, $3, NOW())
        `;
        await pool.query(queryText, [query, response, rating]);
        res.status(200).json({ message: 'Rating submitted successfully!' });
    } catch (error) {
        console.error('Failed to save rating:', error.message);
        res.status(500).json({ message: 'Failed to submit rating!', error: error.message });
    }
});


router.get('/search', async (req, res) => {
    const { keyword, category } = req.query; // Capture search parameters
    let query = `
        SELECT * FROM files 
        WHERE description ILIKE $1 
        OR $1 = ANY(tags) 
        OR category = $2
    `;
    try {
        const result = await pool.query(query, [`%${keyword}%`, category]);
        res.status(200).json({ files: result.rows });
    } catch (error) {
        console.error('Search query failed:', error.message);
        res.status(500).json({ message: 'Search failed!', error: error.message });
    }
});

module.exports = router;