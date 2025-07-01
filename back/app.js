require('dotenv').config();

const express = require('express')
const cors = require('cors');

const app = express()
const port = process.env.PORTBACK

app.use(express.json());
app.use(cors(
  {
    origin: ['https://sqlfacilito.cl', 'http://sqlfacilito.cl', 'http://localhost', 'http://localhost:5173', 'http://www.sqlfacilito.cl', 'https://www.sqlfacilito.cl'],
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

