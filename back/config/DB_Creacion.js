const { Pool } = require('pg');
require('dotenv').config();


const CrearConexionCreacion = () => {
    return new Pool({
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        host: process.env.POSTGRES_HOST_usuarios,
        port: 5432,
        database: 'postgres',
    });
}



module.exports = CrearConexionCreacion;