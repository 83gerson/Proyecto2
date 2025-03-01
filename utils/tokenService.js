const jwt = require('jsonwebtoken');

// Genera el access token
const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '5m' });
};

// Generar refresh token
const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

// Verificar token
const verifyToken = (token, secret) => {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        return null;
    }
};

module.exports = { generateAccessToken, generateRefreshToken, verifyToken };