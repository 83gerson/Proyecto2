const mongoose = require('mongoose');

const FriendshipSchema = new mongoose.Schema({
    usuarioSolicitante: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    usuarioReceptor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    estado: {
        type: String,
        enum: ['pendiente', 'aceptada', 'rechazada'],
        default: 'pendiente',
    },
}, { timestamps: true });

module.exports = mongoose.model('friendship', FriendshipSchema);