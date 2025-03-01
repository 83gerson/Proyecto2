const Post = require('../Models/post.model');

// Crear publicación
const createPost = async (req, res) => {
    const { contenido } = req.body;
    const userId = req.user.id;

    try {
        const post = new Post({ contenido, autor: userId });
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

const tagFriendsInPost = async (req, res) => {
    const { postId } = req.params;
    const { etiquetas } = req.body; // Array de IDs de usuarios a etiquetar
    const userId = req.user.id;

    console.log("ID de la publicación:", postId);
    console.log("Etiquetas recibidas:", etiquetas);

    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Publicación no encontrada' });
        }

        // Verificar que el usuario que etiqueta sea el autor de la publicación
        if (post.autor.toString() !== userId) {
            return res.status(403).json({ message: 'No tienes permisos para etiquetar en esta publicación' });
        }

        // Agregar etiquetas a la publicación
        post.etiquetas = [...new Set([...post.etiquetas, ...etiquetas])]; // Evitar duplicados
        await post.save();

        console.log("Publicación actualizada:", post);
        res.status(200).json(post);
    } catch (error) {
        console.error("Error en tagFriendsInPost:", error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// Ver publicaciones
const getPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('autor', 'nombre avatar');
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Comentar publicación
const commentPost = async (req, res) => {
    const { postId } = req.params;
    const { contenido } = req.body;
    const userId = req.user.id;

    try {
        const post = await Post.findByIdAndUpdate(
            postId,
            { $push: { comentarios: { usuario: userId, contenido } } },
            { new: true }
        );
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Dar like a publicación
const likePost = async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id;

    try {
        const post = await Post.findByIdAndUpdate(
            postId,
            { $addToSet: { likes: userId } },
            { new: true }
        );
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

const getPagePostsForNonFriends = async (req, res) => {
    const userId = req.user.id;

    try {
        // Obtener las páginas que el usuario sigue
        const user = await User.findById(userId).populate('paginasSeguidas');
        const followedPages = user.paginasSeguidas;

        // Si el usuario no sigue ninguna página, obtener publicaciones de páginas aleatorias
        if (followedPages.length === 0) {
            const randomPages = await Page.aggregate([{ $sample: { size: 5 } }]);
            const randomPageIds = randomPages.map(page => page._id);

            const posts = await Post.find({ pagina: { $in: randomPageIds } })
                .populate('autor', 'nombre avatar')
                .populate('pagina', 'nombre');

            return res.status(200).json(posts);
        }

        // Si el usuario sigue páginas, obtener publicaciones de esas páginas
        const posts = await Post.find({ pagina: { $in: followedPages } })
            .populate('autor', 'nombre avatar')
            .populate('pagina', 'nombre');

        res.status(200).json(posts);
    } catch (error) {
        console.error("Error en getPagePostsForNonFriends:", error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

module.exports = { createPost, getPosts, commentPost, likePost, getPagePostsForNonFriends, tagFriendsInPost };