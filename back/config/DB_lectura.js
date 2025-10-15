const { Pool } = require('pg');
require('dotenv').config();

const NewPool = (database) => {
    return new Pool({
        user: process.env.APP_DB_USER,
        password: process.env.APP_DB_PASS,
        host: process.env.POSTGRES_HOST_usuarios,
        port: 5432,
        database: database,
    });
};

module.exports = NewPool;