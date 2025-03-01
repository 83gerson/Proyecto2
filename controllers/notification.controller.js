const Notification = require('../Models/notification.model');
const { sendNotificationEmail } = require('../utils/emailService');
const User = require('../Models/user.model'); // Asegúrate de importar el modelo User

// Enviar notificación
const sendNotification = async (req, res) => {
    const { tipo, usuarioDestino, usuarioOrigen, contenido } = req.body;

    console.log("Datos recibidos:", { tipo, usuarioDestino, usuarioOrigen, contenido });

    try {
        // Verificar que el usuario destino exista
        const user = await User.findById(usuarioDestino);
        if (!user) {
            return res.status(404).json({ message: 'Usuario destino no encontrado' });
        }

        const notification = new Notification({ tipo, usuarioDestino, usuarioOrigen, contenido });
        await notification.save();

        console.log("Notificación creada:", notification);

        // Enviar correo de notificación
        await sendNotificationEmail(user.email, contenido); // Pasar el correo del usuario destino

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
        const notifications = await Notification.find({ usuarioDestino: userId }).populate('usuarioOrigen', 'nombre avatar');
        console.log("Notificaciones encontradas:", notifications);
        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error en getNotifications:", error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

module.exports = { sendNotification, getNotifications };