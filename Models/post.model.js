const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    contenido: {
        type: String,
        required: true,
        trim: true,
    },
    autor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    pagina: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'page',
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    }],
    comentarios: [{
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        },
        contenido: {
            type: String,
            required: true,
        },
        fecha: {
            type: Date,
            default: Date.now,
        },
    }],
    etiquetas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    }],
}, { timestamps: true });

module.exports = mongoose.model('post', PostSchema);