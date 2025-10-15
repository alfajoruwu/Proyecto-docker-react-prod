const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const router = require('../rutas/Ejercicios/CrearEjercicio');
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

describe('Pruebas para el módulo de ejercicios', () => {
    beforeEach(() => {
        // Limpiar todos los mocks antes de cada prueba
        jest.clearAllMocks();
    });

    describe('POST /EvaluarRespuesta', () => {
        it('debería evaluar correctamente una respuesta correcta', async () => {
            const mockRequest = {
                ejercicioId: 1,
                respuestaSQL: 'SELECT * FROM usuarios'
            };

            // Mock para obtener info del ejercicio
            pool.query.mockResolvedValueOnce({
                rows: [{
                    id: 1,
                    dbid: 10,
                    sql_solucion: 'SELECT * FROM usuarios'
                }]
            });

            const mockSolutionResult = {
                rows: [{ id: 1, nombre: 'Usuario 1' }, { id: 2, nombre: 'Usuario 2' }],
                fields: [{ name: 'id' }, { name: 'nombre' }]
            };

            const mockUserResult = {
                rows: [{ id: 1, nombre: 'Usuario 1' }, { id: 2, nombre: 'Usuario 2' }],
                fields: [{ name: 'id' }, { name: 'nombre' }]
            };

            const mockDbPool = {
                query: jest.fn()
                    .mockResolvedValueOnce(mockSolutionResult) // para la consulta de solución
                    .mockResolvedValueOnce(mockUserResult) // para la consulta del usuario
            };

            NewPool.mockReturnValue(mockDbPool);

            // Mock para insertar el intento
            pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

            const response = await request(app)
                .post('/EvaluarRespuesta')
                .send(mockRequest);

            expect(response.status).toBe(200);
            expect(response.body.esCorrecta).toBe(true);
            // Verificar que se guardó el resultado en CSV
            expect(pool.query).toHaveBeenCalledWith(
                'INSERT INTO Intentos (ID_Usuario, ID_Ejercicio, Tipo, SQL_Intento, Es_Correcto, Resultado_CSV) VALUES ($1, $2, $3, $4, $5, $6)',
                expect.arrayContaining([1, 1, 'IntentoResolucion', 'SELECT * FROM usuarios', true, expect.any(String)])
            );
        });

        it('debería evaluar correctamente una respuesta incorrecta', async () => {
            const mockRequest = {
                ejercicioId: 1,
                respuestaSQL: 'SELECT * FROM usuarios'
            };

            // Mock para obtener info del ejercicio
            pool.query.mockResolvedValueOnce({
                rows: [{
                    id: 1,
                    dbid: 10,
                    sql_solucion: 'SELECT * FROM usuarios WHERE id = 1'
                }]
            });

            const mockSolutionResult = {
                rows: [{ id: 1, nombre: 'Usuario 1' }],
                fields: [{ name: 'id' }, { name: 'nombre' }]
            };

            const mockUserResult = {
                rows: [{ id: 1, nombre: 'Usuario 1' }, { id: 2, nombre: 'Usuario 2' }],
                fields: [{ name: 'id' }, { name: 'nombre' }]
            };

            const mockDbPool = {
                query: jest.fn()
                    .mockResolvedValueOnce(mockSolutionResult) // para la consulta de solución
                    .mockResolvedValueOnce(mockUserResult) // para la consulta del usuario
            };

            NewPool.mockReturnValue(mockDbPool);

            // Mock para insertar el intento
            pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

            const response = await request(app)
                .post('/EvaluarRespuesta')
                .send(mockRequest);

            expect(response.status).toBe(200);
            expect(response.body.esCorrecta).toBe(false);
            // Verificar que se guardó el resultado en CSV
            expect(pool.query).toHaveBeenCalledWith(
                'INSERT INTO Intentos (ID_Usuario, ID_Ejercicio, Tipo, SQL_Intento, Es_Correcto, Resultado_CSV) VALUES ($1, $2, $3, $4, $5, $6)',
                expect.arrayContaining([1, 1, 'IntentoResolucion', 'SELECT * FROM usuarios', false, expect.any(String)])
            );
        });

        it('debería manejar errores en la consulta SQL del usuario', async () => {
            const mockRequest = {
                ejercicioId: 1,
                respuestaSQL: 'SELECT * FROM tabla_que_no_existe'
            };

            // Mock para obtener info del ejercicio
            pool.query.mockResolvedValueOnce({
                rows: [{
                    id: 1,
                    dbid: 10,
                    sql_solucion: 'SELECT * FROM usuarios'
                }]
            });

            const mockSolutionResult = {
                rows: [{ id: 1, nombre: 'Usuario 1' }],
                fields: [{ name: 'id' }, { name: 'nombre' }]
            };

            const mockQueryError = new Error('Tabla no existe');

            const mockDbPool = {
                query: jest.fn()
                    .mockResolvedValueOnce(mockSolutionResult) // para la consulta de solución
                    .mockRejectedValueOnce(mockQueryError) // para la consulta del usuario (con error)
            };

            NewPool.mockReturnValue(mockDbPool);

            // Mock para insertar el intento
            pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

            const response = await request(app)
                .post('/EvaluarRespuesta')
                .send(mockRequest);

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Error en tu consulta SQL');
            // Verificar que se guardó el error en la BD
            expect(pool.query).toHaveBeenCalledWith(
                'INSERT INTO Intentos (ID_Usuario, ID_Ejercicio, Tipo, SQL_Intento, Es_Correcto, Resultado_CSV) VALUES ($1, $2, $3, $4, $5, $6)',
                [1, 1, 'IntentoResolucion', 'SELECT * FROM tabla_que_no_existe', false, 'ERROR: ' + mockQueryError.message]
            );
        });
    });
});
