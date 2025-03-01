const nodemailer = require('nodemailer');

// Configuración del transporte de correo
const transporter = nodemailer.createTransport({
    service: 'gmail', // Puedes usar otro servicio como Outlook, Yahoo, etc.
    auth: {
        user: process.env.EMAIL_USER, // Correo electrónico del remitente
        pass: process.env.EMAIL_PASSWORD, // Contraseña del correo
    },
});

// Enviar correo de bienvenida
const sendWelcomeEmail = async (email, nombre) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Bienvenido a nuestra red social',
        text: `Hola ${nombre}, ¡bienvenido a nuestra red social!`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo de bienvenida enviado.');
    } catch (error) {
        console.error('Error enviando correo de bienvenida:', error);
    }
};

// Enviar correo de notificación
const sendNotificationEmail = async (email, contenido) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Nueva notificación',
        text: `Tienes una nueva notificación: ${contenido}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo de notificación enviado.');
    } catch (error) {
        console.error('Error enviando correo de notificación:', error);
    }
};

module.exports = { sendWelcomeEmail, sendNotificationEmail };