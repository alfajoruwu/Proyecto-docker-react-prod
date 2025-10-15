const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const router = require('../rutas/Ejercicios/RegistrarInformacion');
const pool = require('../config/DB');
const NewPool = require('../config/DB_lectura');

// Mock de las dependencias
jest.mock('../config/DB');
jest.mock('../config/DB_lectura');
jest.mock('../middleware/TipoUsuario.js', () => ({
    authMiddleware: (req, res, next) => {
        req.user = { id: 1, rol: 'usuario' };
        next();
    },
    Verifica: () => (req, res, next) => next()
}));

const app = express();
app.use(bodyParser.json());
app.use('/', router);

describe('Pruebas para el módulo de registro de información', () => {
    beforeEach(() => {
        // Limpiar todos los mocks antes de cada prueba
        jest.clearAllMocks();
    });

    describe('POST /RealizarIntento', () => {
        it('debería registrar correctamente un intento de resolución sin resultado', async () => {
            const mockRequest = {
                ejercicioId: 1,
                sqlIntento: 'SELECT * FROM usuarios',
                esCorrecto: true
            };

            pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

            const response = await request(app)
                .post('/RealizarIntento')
                .send(mockRequest);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Intento registrado correctamente');
            expect(response.body.intentoId).toBe(1);
            expect(pool.query).toHaveBeenCalledWith(
                'INSERT INTO Intentos (ID_Usuario, ID_Ejercicio, Tipo, SQL_Intento, Es_Correcto, Resultado_CSV) VALUES ($1, $2, $3, $4, $5, $6) RETURNING ID',
                [1, 1, 'IntentoResolucion', 'SELECT * FROM usuarios', true, null]
            );
        });

        it('debería registrar correctamente un intento de resolución con resultado', async () => {
            const mockRequest = {
                ejercicioId: 1,
                sqlIntento: 'SELECT * FROM usuarios',
                esCorrecto: true,
                resultado: {
                    columnas: ['id', 'nombre'],
                    filas: [
                        { id: 1, nombre: 'Usuario 1' },
                        { id: 2, nombre: 'Usuario 2' }
                    ]
                }
            };

            pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

            const response = await request(app)
                .post('/RealizarIntento')
                .send(mockRequest);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Intento registrado correctamente');
            expect(response.body.intentoId).toBe(1);
            expect(response.body.resultadoCSV).toBe('id\tnombre\n1\tUsuario 1\n2\tUsuario 2');
            expect(pool.query).toHaveBeenCalled();
        });

        it('debería devolver error cuando faltan datos obligatorios', async () => {
            const response = await request(app)
                .post('/RealizarIntento')
                .send({ sqlIntento: 'SELECT * FROM usuarios' }); // falta ejercicioId

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Faltan datos obligatorios');
            expect(pool.query).not.toHaveBeenCalled();
        });
    });

    describe('POST /EjecucionSQL', () => {
        it('debería registrar correctamente una ejecución SQL', async () => {
            const mockRequest = {
                dbId: 1,
                sqlQuery: 'SELECT * FROM usuarios',
                ejercicioId: 1
            };

            const mockQueryResult = {
                rows: [
                    { id: 1, nombre: 'Usuario 1' },
                    { id: 2, nombre: 'Usuario 2' }
                ],
                fields: [
                    { name: 'id' },
                    { name: 'nombre' }
                ]
            };

            const mockDbPool = {
                query: jest.fn().mockResolvedValue(mockQueryResult)
            };

            NewPool.mockReturnValue(mockDbPool);
            pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

            const response = await request(app)
                .post('/EjecucionSQL')
                .send(mockRequest);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Ejecución SQL registrada correctamente');
            expect(response.body.resultadoCSV).toBeTruthy();
            expect(pool.query).toHaveBeenCalled();
        });
    });

    describe('POST /ConsultaIA', () => {
        it('debería registrar correctamente una consulta a la IA', async () => {
            const mockRequest = {
                pregunta: '¿Cómo hago un JOIN?',
                respuesta: 'Para hacer un JOIN debes...',
                ejercicioId: 1,
                tipoInteraccion: 'Ayuda'
            };

            pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

            const response = await request(app)
                .post('/ConsultaIA')
                .send(mockRequest);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Consulta IA registrada');
            expect(response.body.consultaId).toBe(1);
            expect(pool.query).toHaveBeenCalled();
        });
    });
});
