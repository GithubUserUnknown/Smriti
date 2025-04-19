
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
                name VARCHAR(100),
                email VARCHAR(100) UNIQUE
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