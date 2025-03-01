const express = require('express');
const { sendNotification, getNotifications } = require('../controllers/notification.controller');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware de autenticación
router.use(authMiddleware);

// Enviar notificación
router.post('/send', sendNotification);

// Obtener notificaciones
router.get('/', getNotifications);

module.exports = router;