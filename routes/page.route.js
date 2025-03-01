const express = require('express');
const { createPage, followPage, getPages, editPage } = require('../controllers/page.controller');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware de autenticación
router.use(authMiddleware);

// Crear página
router.post('/create', createPage);

// Seguir página
router.post('/:pageId/follow', followPage);

router.put('/:pageId/edit', authMiddleware, editPage);

// Ver páginas
router.get('/', getPages);

module.exports = router;