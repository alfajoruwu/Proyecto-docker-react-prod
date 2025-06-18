const { Pool } = require('pg');
require('dotenv').config();

const poolCreacion = new Pool({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST_usuarios,
    port: 5432,
    database: 'postgres',
});

module.exports = poolCreacion;