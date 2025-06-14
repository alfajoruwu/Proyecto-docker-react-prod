
CREATE TABLE Usuarios (
    ID SERIAL PRIMARY KEY,
    nombre TEXT,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    rol VARCHAR(50) DEFAULT 'usuario',
    Fecha_Registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE BaseDatos (
    ID SERIAL PRIMARY KEY,
    Nombre TEXT,
    ID_DB VARCHAR(100),
    SQL_init TEXT,
    Descripcion TEXT,
    ID_Usuario int, 
    Fecha_Creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ID_Usuario)
        REFERENCES Usuarios(ID)
        ON DELETE SET NULL
);

CREATE TABLE Ejercicios (
    ID SERIAL PRIMARY KEY,
    Nombre_Ej VARCHAR(100) NOT NULL,
    ID_Usuario INT NOT NULL,
    Problema TEXT NOT NULL,
    Descripcion TEXT,
    SQL_Solucion TEXT NOT NULL,
    ID_BaseDatos INT NOT NULL,
    Fecha_Creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ID_Usuario)
        REFERENCES Usuarios(ID)
        ON DELETE SET NULL,
    FOREIGN KEY (ID_BaseDatos)
        REFERENCES BaseDatos(ID)
        ON DELETE CASCADE
);

CREATE TABLE Intentos (
    ID SERIAL PRIMARY KEY,
    ID_Usuario INT NOT NULL,
    ID_Ejercicio INT NOT NULL,
    Fecha_Hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    SQL_Intento TEXT NOT NULL,
    Es_Correcto BOOLEAN,
    FOREIGN KEY (ID_Usuario)
        REFERENCES Usuarios(ID)
        ON DELETE CASCADE,
    FOREIGN KEY (ID_Ejercicio)
        REFERENCES Ejercicios(ID)
        ON DELETE CASCADE
);

CREATE TABLE AyudaIA (
    ID SERIAL PRIMARY KEY,
    ID_Usuario INT NOT NULL,
    ID_Ejercicio INT,
    Fecha_Hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Pregunta TEXT NOT NULL,
    Respuesta_IA TEXT NOT NULL,
    Tipo_Interaccion VARCHAR(50), 
    FOREIGN KEY (ID_Usuario)
        REFERENCES Usuarios(ID)
        ON DELETE CASCADE,
    FOREIGN KEY (ID_Ejercicio)
        REFERENCES Ejercicios(ID)
        ON DELETE SET NULL
);
