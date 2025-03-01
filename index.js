const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const apiRouter = require('./api.router'); // Importa el router de la API

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta "client"
app.use(express.static(path.join(__dirname, 'client')));

// Ruta raíz para servir login.html
app.get('/', (_, res) => {
    res.sendFile(path.join(__dirname, 'client', '/html/login.html'));
});

// Conexión a MongoDB
mongoose.connect(process.env.DB_CNN)
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error de conexión a MongoDB:', err));

// Rutas de la API
app.use('/api', apiRouter);

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Frontend corriendo en http://localhost:${PORT}`);
    console.log(`API corriendo en http://localhost:${PORT}/api`);
});