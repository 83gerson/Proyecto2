const User = require('../Models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('../utils/emailService');

// Registro del usuario
const register = async (req, res) => {
    const { nombre, email, password, biografia, avatar } = req.body;

    try {
        // Verifica si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'El correo ya está registrado' });
        }

        // Crea un nuevo usuario con el avatar
        const user = new User({
            nombre,
            email,
            password,
            biografia,
            avatar: avatar || 'default-avatar.png', // Usa el avatar proporcionado o el valor por defecto
        });

        await user.save();

        // Correo de bienvenida
        await sendWelcomeEmail(email, nombre);

        // Generacion de tokens
        const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '5m' });
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            accessToken,
            refreshToken
        });
    } catch (error) {
        console.error("Error en el registro:", error);
    }
};

// Login de usuario
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Verifica si el usuario existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        // Verifica la contraseña
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        // Generacion de tokens
        const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '5m' });
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

        res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Logout de usuario
const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: 'No se proporcionó un refresh token' });
        }

        // Verifica si el refreshToken es válido
        try {
            jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch (error) {
            return res.status(401).json({ message: 'Refresh token inválido o expirado' });
        }

        res.status(200).json({ message: 'Sesión cerrada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al cerrar sesión' });
    }
};

// Refresh token
const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '5m' });
        res.status(200).json({ accessToken });
    } catch (error) {
        res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

module.exports = { register, login, logout, refreshToken };