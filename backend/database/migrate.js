
const { Client } = require('pg'); // For PostgreSQL
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'smritidbp',
    password: 'Post6789@',
    port: 5432, // Default PostgreSQL port
});

async function migrate() {
    try {
        await client.connect();
        console.log("Connected to the database!");

        // Example: Create a table
        const query = `
            CREATE TABLE IF NOT EXISTS users (         
            id SERIAL PRIMARY KEY,
            description TEXT,
            tags TEXT[],
            category VARCHAR(100),
            filename VARCHAR(255),
            filepath VARCHAR(255),
            upload_date TIMESTAMP DEFAULT NOW()
            );
        `;
        await client.query(query);
        console.log("Migration completed!");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await client.end();
        console.log("Database connection closed.");
    }
}

migrate();