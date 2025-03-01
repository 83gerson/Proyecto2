const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    tipo: {
        type: String,
        required: true,
        enum: ['bienvenida', 'solicitud_amistad', 'aceptacion_amistad', 'like', 'comentario'],
    },
    usuarioDestino: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    usuarioOrigen: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    contenido: {
        type: String,
        required: true,
    },
    leida: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

module.exports = mongoose.model('notification', NotificationSchema);