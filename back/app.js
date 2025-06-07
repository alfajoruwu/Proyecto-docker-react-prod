require('dotenv').config();

const express = require('express')
const cors = require('cors');

const app = express()
const port = process.env.PORTBACK

app.use(express.json());
app.use(cors());

// Rutas
const usuarios = require('./rutas/Usuario/Login');
const ejemplos = require('./rutas/Ejemplos/Ejemplos');
const ejemploProtegida = require('./rutas/Ejemplos/EjemploProtegida');


app.use('/usuarios', usuarios);

app.use('/ejemplos', ejemplos);
app.use('/ejemplos-protegida', ejemploProtegida);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Ejemplo de Express ${port}`)
})

