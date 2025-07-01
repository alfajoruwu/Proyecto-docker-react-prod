require('dotenv').config();

const express = require('express')
const cors = require('cors');

const app = express()
const port = process.env.PORTBACK

app.use(cors({
  origin: true, // Permite cualquier origen
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Rutas
const ejemplos = require('./rutas/Ejemplos/Ejemplos');
const ejemploProtegida = require('./rutas/Ejemplos/EjemploProtegida');

//Usuarios
const usuarios = require('./rutas/Usuario/Login');

//DB
const baseDatosCrear = require('./rutas/BaseDatos/CrearBaseDatos');
const baseDatosUsar = require('./rutas/BaseDatos/UsarBaseDatos');

//Ejericicos
const CrearEjercicio = require('./rutas/Ejercicios/CrearEjercicio');
const Resultados = require('./rutas/Ejercicios/RegistrarInformacion');

app.use(express.json());
// IA
const IA = require('./rutas/IA/IA');


app.use('/usuarios', usuarios);

app.use('/basedatos', baseDatosCrear);
app.use('/basedatos', baseDatosUsar);

app.use('/ejericicios', CrearEjercicio);
app.use('/ejericicios', Resultados);

app.use('/IA', IA);

//app.use('/ejemplos', ejemplos);
//app.use('/ejemplos-protegida', ejemploProtegida);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Ejemplo de Express ${port}`)
})

