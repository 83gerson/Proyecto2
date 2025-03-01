const mongoose = require('mongoose');

const PageSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    descripcion: {
        type: String,
        default: '',
    },
    administrador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    seguidores: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    }],
}, { timestamps: true });

module.exports = mongoose.model('page', PageSchema);