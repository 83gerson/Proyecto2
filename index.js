const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth.route');
const userRoutes = require('./routes/user.route');
const postRoutes = require('./routes/post.route');
const pageRoutes = require('./routes/page.route');
const notificationRoutes = require('./routes/notification.route');
const { startCronJobs } = require('./utils/cronJobs');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    return res.send("Bienvenido al api");
});

// Conexión a MongoDB
mongoose.connect(process.env.DB_CNN)
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error de conexión a MongoDB:', err));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/notifications', notificationRoutes);

// Iniciar cron jobs
startCronJobs();

// Iniciar servidor
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));