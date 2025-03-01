const Notification = require('../Models/notification.model');
const { sendNotificationEmail } = require('../utils/emailService');
const User = require('../Models/user.model');

// Envío de notificación
const sendNotification = async (req, res) => {
    const { tipo, usuarioDestino, usuarioOrigen, contenido } = req.body;

    console.log("Datos recibidos:", { tipo, usuarioDestino, usuarioOrigen, contenido });

    try {
        // Verifica que el usuario destino exista
        const user = await User.findById(usuarioDestino);
        if (!user) {
            return res.status(404).json({ message: 'Usuario destino no encontrado' });
        }

        const notification = new Notification({
            tipo: 'solicitud_amistad',
            usuarioDestino,
            usuarioOrigen,
            contenido,
            metadata: {
                senderId: usuarioOrigen, // ID del usuario que envía la solicitud
                requestId: usuarioDestino, // ID de la solicitud 
            },
        });
        await notification.save();

        console.log("Notificación creada:", notification);

        // Envía correo de notificación
        await sendNotificationEmail(user.email, contenido); // Pasa el correo del usuario destino

        res.status(201).json(notification);
    } catch (error) {
        console.error("Error en sendNotification:", error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// Obtener notificaciones
const getNotifications = async (req, res) => {
    const userId = req.user.id;

    console.log("ID del usuario:", userId);

    try {
        const notifications = await Notification.find({ usuarioDestino: userId })
            .populate('usuarioOrigen', 'nombre avatar');
        console.log("Notificaciones encontradas:", notifications);
        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error en getNotifications:", error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

module.exports = { sendNotification, getNotifications };