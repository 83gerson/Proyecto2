const { body, validationResult } = require('express-validator');

// Validaciones para el registro de usuarios
const validateRegister = [
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('email').isEmail().withMessage('El correo no es válido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('biografia').optional().isString().withMessage('La biografía debe ser un texto'),
];

// Validaciones para el login de usuarios
const validateLogin = [
    body('email').isEmail().withMessage('El correo no es válido'),
    body('password').notEmpty().withMessage('La contraseña es requerida'),
];

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = { validateRegister, validateLogin, handleValidationErrors };