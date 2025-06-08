-- init.sql

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre TEXT,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    rol VARCHAR(50) DEFAULT 'usuario'
);

