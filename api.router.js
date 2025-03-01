const express = require('express');
const apiRouter = express.Router();

// Ruta de bienvenida de la API
// apiRouter.get('/', (req, res) => {
//     return res.send('Bienvenido al API');
// });

// Rutas de autenticación
apiRouter.use('/auth', require('./routes/auth.route'));

// Rutas de usuarios
apiRouter.use('/users', require('./routes/user.route'));

// Rutas de publicaciones
apiRouter.use('/posts', require('./routes/post.route'));

// Rutas de páginas
apiRouter.use('/pages', require('./routes/page.route'));

// Rutas de notificaciones
apiRouter.use('/notifications', require('./routes/notification.route'));

module.exports = apiRouter;