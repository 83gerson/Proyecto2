const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    biografia: {
        type: String,
        default: '',
    },
    avatar: {
        type: String,
        default: 'default-avatar.png', // Ruta a una imagen predeterminada
    },
    amigos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    }],
    solicitudesAmistadEnviadas: [{  // Nuevo campo
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: [],
    }],
    solicitudesAmistadRecibidas: [{  // Nuevo campo
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: [],
    }],
    paginasSeguidas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'page',
    }],
    usuariosBloqueados: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    }],
}, { timestamps: true });

// Hash de la contraseña antes de guardar
UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('user', UserSchema);