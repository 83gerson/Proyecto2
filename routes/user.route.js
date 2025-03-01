const express = require('express');
const { editProfile, searchFriends, blockUser, getProfile, deleteProfile, addFriend, removeFriend, rejectFriendRequest, acceptFriendRequest } = require('../controllers/user.controller');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware de autenticación
router.use(authMiddleware);

// Editar perfil
router.put('/edit-profile', editProfile);

// Buscar amigos
router.get('/search-friends', searchFriends);

// Bloquear usuario
router.post("/block-user", authMiddleware, blockUser);

// Ruta protegida para obtener el perfil del usuario
router.get('/me', authMiddleware, getProfile);

// Eliminar perfil
router.delete('/delete-profile', deleteProfile);

router.post("/add-friend", authMiddleware, addFriend);

router.post("/remove-friend", authMiddleware, removeFriend);

router.post("/reject-request", authMiddleware, rejectFriendRequest);

router.post("/accept-friend-request", authMiddleware, acceptFriendRequest);

module.exports = router;