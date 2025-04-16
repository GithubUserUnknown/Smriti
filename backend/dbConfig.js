const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'smritidbp',
    password: 'Post6789@', // Replace with your actual password
    port: 5432, // Default PostgreSQL port
});

module.exports = pool;