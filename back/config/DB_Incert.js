const { Pool } = require('pg');
require('dotenv').config();

const NewPool_create = (database) => {
    return new Pool({
        user: process.env.CreacionTablas_user,
        password: process.env.CreacionTablas_pass,
        host: process.env.POSTGRES_HOST_usuarios,
        port: 5432,
        database: database,
    });
};

module.exports = NewPool_create;