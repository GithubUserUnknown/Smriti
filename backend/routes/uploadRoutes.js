const express = require('express');
const multer = require('multer');
const axios = require('axios'); // For making HTTP requests to the Gemini API
const pool = require('../dbConfig'); // Import database config
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const fs = require('fs');
const pdfParse = require('pdf-parse');

// Define file storage setup for multer
const upload = multer({ storage });

router.post('/upload', authMiddleware, upload.fields([{ name: 'file' }, { name: 'image' }]), async (req, res) => {
    try {
        // Check if user exists in request
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const userId = req.user.id; // numeric id
        const googleId = req.user.googleId?.toString(); // google id from token

        if (!userId && !googleId) {
            return res.status(401).json({ message: 'User identification missing' });
        }

        const file = req.files?.file?.[0];
        const image = req.files?.image?.[0];

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const filePath = file.path; // Path to the uploaded file on the server
        

        let parsedContent = '';

        // Validate file type and parse content accordingly
        if (file.mimetype === 'application/pdf') {
            const pdfData = fs.readFileSync(filePath);
            const parsedPdf = await pdfParse(pdfData);
            parsedContent = parsedPdf.text; // Extract text from PDF
        } else if (file.mimetype === 'text/plain') {
            parsedContent = fs.readFileSync(filePath, 'utf8'); // Read text file content
        } else {
            parsedContent = 'Unsupported file type for parsing'; // Handle unsupported formats gracefully
        }

        // Process tags
        const tags = req.body.tags?.split(',').map(tag => tag.trim().toLowerCase());
        if (!tags || tags.length === 0) {
            return res.status(400).json({ message: 'Tags are required and must be unique.' });
        }

        // Check for existing tags
        const existingTagCheck = await pool.query(
            `SELECT 1 FROM company_uploads 
             WHERE (user_id = $1 OR google_id = $2) 
             AND tags && $3::TEXT[]`,
            [userId, googleId, tags]
        );

        if (existingTagCheck.rowCount > 0) {
            return res.status(400).json({ message: 'Some tags are already in use for this user. Tags must be unique.' });
        }

        // Insert upload details
        const query = `
            INSERT INTO company_uploads 
            (user_id, google_id, file_name, file_path, file_type, image_path, 
             description, category, tags, parsed_content) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;

        const result = await pool.query(query, [
            userId,
            googleId,
            file.originalname,
            file.path,
            file.mimetype,
            image?.path || null, // Optional image path
            req.body.description || null,
            req.body.category || null,
            tags,
            parsedContent || null,
        ]);

        res.status(200).json({ 
            message: 'File uploaded successfully!', 
            tags,
            fileId: result.rows[0].id
        });
    } catch (error) {
        console.error('Upload failed:', error);
        res.status(500).json({ 
            message: 'Upload failed!', 
            error: error.message 
        });
    }
});


const nlp = require('compromise');
router.post('/ai-query', authMiddleware, async (req, res) => {
    const {
        query: userQuery,
        name = 'Smriti',
        gender = 'female',
        age = 23,
        behaviorPrompt = '',
        conversationHistory: clientHistory = '',
        persistentCompanyContext = ''
    } = req.body;

        const userId = req.user.id; // numeric id
        const googleId = req.user.googleId?.toString(); // google id from token

        if (!userId && !googleId) {
            return res.status(401).json({ message: 'User identification missing' });
        }

    try {
        // Fetch available tags and their associated parsed content
        const uploadsResult = await pool.query(
            'SELECT tags, parsed_content FROM company_uploads WHERE tags IS NOT NULL AND (google_id = $1 OR user_id = $2)',
            [googleId ,userId]
        );

        const conversationContext = clientHistory.trim();

        // Find uploads whose tags match the user query
        const matchedUploads = uploadsResult.rows.filter(row => 
            row.tags.some(tag => userQuery.toLowerCase().includes(tag.toLowerCase()))
        );
  
        // Build personality instruction text
        const personalityInstruction = `
            Please respond as if you are a ${age}-year-old ${gender} named ${name}.
            ${behaviorPrompt || "You are cheerful, bright, and a bit flirty. Your tone should be warm, playful, and friendly."}
        `.trim();

        let prompt = '';
        let companyDataUsed = false;
        let companyContext = '';

        // If we have matching tags or persistent context, include the relevant company data
        if (matchedUploads.length > 0 || persistentCompanyContext) {
            if (matchedUploads.length > 0) {
                // Only use parsed content from documents with matching tags
                companyContext = matchedUploads
                    .map(row => row.parsed_content)
                    .filter(Boolean)
                    .join('\n\n');
            } else {
                // Use previously persisted company data if no new matches
                companyContext = persistentCompanyContext;
            }
            companyDataUsed = true;

            if (conversationContext.length) {
                prompt = `${personalityInstruction}\n\nConversation so far:\n${conversationContext}\n\nUse the context to generate a response:\n${companyContext}\n\nUser: ${userQuery}`;
            } else {
                prompt = `${personalityInstruction}\nUse this company data to generate a response:\n${companyContext}\n\nUser: ${userQuery}`;
            }
        } else {
            // If no company context is involved, build the prompt normally
            if (conversationContext.length) {
                prompt = `${personalityInstruction}\n\nConversation so far:\n${conversationContext}\n\nUser: ${userQuery}`;
            } else {
                prompt = `${personalityInstruction}\nUser: ${userQuery}`;
            }
        }

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
            `INSERT INTO query_history (user_id, google_id, query, response) VALUES ($1, $2, $3, $4)`,
            [userId, googleId, userQuery, generatedResponse]
        );
    } catch (error) {
        console.error('AI query processing failed:', error.message);
        res.status(500).json({ message: 'Failed to process AI query!', error: error.message });
    }
});

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

router.post('/submit-rating', authMiddleware, async (req, res) => {
    try {
        // Check if user exists in request
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const { query, response, rating } = req.body;
        const userId = req.user.id;
        const googleId = req.user.googleId;

        if (!userId && !googleId) {
            return res.status(401).json({ message: 'User identification missing' });
        }

        // Validate rating value
        const numericRating = Number(rating);
        if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ message: 'Invalid rating value' });
        }

        // Insert rating into database
        const queryText = `
            INSERT INTO ratings (
                user_id, 
                google_id, 
                query, 
                response, 
                rating, 
                created_at
            )
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING id
        `;

        const result = await pool.query(queryText, [
            userId,
            googleId,
            query,
            response,
            numericRating
        ]);

        res.status(200).json({ 
            message: 'Rating submitted successfully!',
            ratingId: result.rows[0].id
        });
    } catch (error) {
        console.error('Failed to save rating:', error);
        res.status(500).json({ 
            message: 'Failed to submit rating',
            error: error.message 
        });
    }
});

router.get('/search', authMiddleware, async (req, res) => {
    // Retrieve search parameters from query string
    const { keyword, category } = req.query;

    // Modified SQL query: Only return records where the google_id matches the logged-in user.
    const sqlQuery = `
        SELECT * FROM company_uploads
        WHERE (description ILIKE $1 OR $1 = ANY(tags) OR category = $2)
        AND google_id = $3
    `;

    try {
        // Use req.user.googleId for filtering uploads of the authenticated user.
        const result = await pool.query(sqlQuery, [`%${keyword}%`, category, req.user.googleId]);
        res.status(200).json({ files: result.rows });
    } catch (error) {
        console.error('Search query failed:', error.message);
        res.status(500).json({ message: 'Search failed!', error: error.message });
    }
});

module.exports = router;
