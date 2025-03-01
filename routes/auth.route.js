const express = require('express');
const { register, login, logout, refreshToken } = require('../controllers/auth.controller');

const router = express.Router();

// Registro de usuario
router.post('/register', register);

// Login de usuario
router.post('/login', login);

// Logout de usuario
router.post('/logout', logout);

// Refresh token
router.post('/refresh-token', refreshToken);

module.exports = router;