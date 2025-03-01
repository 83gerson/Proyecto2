const express = require('express');
const { createPost, getPosts, commentPost, likePost, getPagePostsForNonFriends, tagFriendsInPost } = require('../controllers/post.controller');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware de autenticación
router.use(authMiddleware);

// Crear publicación
router.post('/create', createPost);

// Ver publicaciones
router.get('/', getPosts);

// Comentar publicación
router.post('/:postId/comment', commentPost);

// Dar like a publicación
router.post('/:postId/like', likePost);

router.get('/page-posts', authMiddleware, getPagePostsForNonFriends);

router.post('/:postId/tag-friends', authMiddleware, tagFriendsInPost);

module.exports = router;