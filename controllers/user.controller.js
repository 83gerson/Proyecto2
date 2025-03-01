const User = require('../Models/user.model');
const sendNotification = require('../Models/notification.model');
const Page = require('../Models/page.model');
const Post = require('../Models/post.model');

// Editar perfil
const editProfile = async (req, res) => {
    const { nombre, biografia, avatar } = req.body;
    const userId = req.user.id; // Obtiene el ID del usuario autenticado

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Actualiza los campos del usuario
        user.nombre = nombre || user.nombre;
        user.biografia = biografia || user.biografia;
        user.avatar = avatar || user.avatar;

        await user.save();

        res.status(200).json({ message: 'Perfil actualizado correctamente', user });
    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Buscar amigos
const searchFriends = async (req, res) => {
    try {
        const userId = req.user.id; // ID del usuario autenticado
        const { query } = req.query;

        // Obtiene el usuario autenticado para acceder a su lista de bloqueados
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Busca usuarios que coincidan con la consulta y no estén bloqueados
        const users = await User.find({
            nombre: { $regex: query, $options: 'i' },
            _id: { $nin: user.usuariosBloqueados } // Excluye usuarios bloqueados
        }).select('nombre avatar'); // Selecciona solo los campos necesarios

        res.status(200).json(users);
    } catch (error) {
        console.error('Error en searchFriends:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// Bloquear usuario
const blockUser = async (req, res) => {
    try {
        const userId = req.user.id; // ID del usuario que bloquea
        const { blockedUserId } = req.body; // ID del usuario a bloquear

        // Verifica que el ID del usuario a bloquear esté presente
        if (!blockedUserId) {
            return res.status(400).json({ message: "Se requiere el ID del usuario a bloquear" });
        }

        // Busca al usuario actual
        const user = await User.findById(userId);

        // Verifica que el usuario exista
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Verifica que el usuario no esté ya bloqueado
        if (user.usuariosBloqueados.includes(blockedUserId)) {
            return res.status(400).json({ message: "El usuario ya está bloqueado" });
        }

        // Agrega al usuario a la lista de bloqueados
        user.usuariosBloqueados.push(blockedUserId);

        await user.save();

        res.status(200).json({ message: "Usuario bloqueado" });
    } catch (error) {
        console.error("Error en blockUser:", error);
        res.status(500).json({ message: "Error al bloquear usuario", error: error.message });
    }
};

// Obtiene el perfil del usuario
const getProfile = async (req, res) => {
    try {
        // Obtiene el usuario
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('amigos', 'nombre avatar');

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error al obtener el perfil:", error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

const deleteProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // Elimina las páginas relacionadas con el usuario
        await Page.deleteMany({ administrador: userId });

        // Elimina las publicaciones relacionadas con el usuario
        await Post.deleteMany({ autor: userId });

        // Elimina al usuario de la base de datos
        await User.findByIdAndDelete(userId);

        res.status(200).json({ message: 'Perfil y contenido relacionado eliminado exitosamente' });
    } catch (error) {
        console.error("Error al eliminar el perfil:", error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
}

const removeFriend = async (req, res) => {
    try {
        const userId = req.user.id; // ID del usuario que elimina al amigo
        const { friendId } = req.body; // ID del amigo a eliminar

        // Verifica que el ID del amigo esté presente
        if (!friendId) {
            return res.status(400).json({ message: "Se requiere el ID del amigo" });
        }

        // Busca al usuario actual y al amigo
        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        // Verifica que ambos usuarios existan
        if (!user || !friend) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Verifica que sean amigos
        if (!user.amigos.includes(friendId)) {
            return res.status(400).json({ message: "No son amigos" });
        }

        // Elimina al amigo de ambas listas
        user.amigos = user.amigos.filter(id => id.toString() !== friendId);
        friend.amigos = friend.amigos.filter(id => id.toString() !== userId);

        await user.save();
        await friend.save();

        res.status(200).json({ message: "Amigo eliminado" });
    } catch (error) {
        console.error("Error en removeFriend:", error);
        res.status(500).json({ message: "Error al eliminar amigo", error: error.message });
    }
};

const addFriend = async (req, res) => {
    try {
        const userId = req.user.id;
        const { friendId } = req.body;

        if (!friendId) {
            return res.status(400).json({ message: "Se requiere el ID del amigo" });
        }

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!friend) {
            return res.status(404).json({ message: "El usuario no existe" });
        }

        // Verifica si ya son amigos
        if (user.amigos.some(id => id.equals(friendId))) {
            return res.status(400).json({ message: "Ya son amigos" });
        }

        // Verifica si ya se envió una solicitud
        if (user.solicitudesAmistadEnviadas?.some(id => id.equals(friendId))) {
            return res.status(400).json({ message: "Solicitud ya enviada" });
        }

        // Verifica si el amigo ya tiene una solicitud pendiente
        if (friend.solicitudesAmistadRecibidas?.some(id => id.equals(userId))) {
            return res.status(400).json({ message: "El usuario ya tiene la solicitud pendiente" });
        }

        // Verifica si el usuario fue rechazado anteriormente
        if (friend.solicitudesAmistadRechazadas?.some(id => id.equals(userId))) {
            return res.status(400).json({ message: "No puedes enviar una solicitud a este usuario" });
        }

        // Agregar solicitud de amistad
        user.solicitudesAmistadEnviadas.push(friendId);
        friend.solicitudesAmistadRecibidas.push(userId);

        await user.save();
        await friend.save();

        await sendNotification({
            tipo: 'solicitud_amistad',
            usuarioDestino: friendId,
            usuarioOrigen: userId,
            contenido: `${user.nombre} te ha enviado una solicitud de amistad.`,
        });

        res.status(200).json({ message: "Solicitud enviada" });
    } catch (error) {
        console.error("Error en addFriend:", error);
        res.status(500).json({ message: "Error al enviar la solicitud", error: error.message });
    }
};

const acceptFriendRequest = async (req, res) => {
    try {
        const userId = req.user.id; // ID del usuario que acepta la solicitud
        const { senderId } = req.body; // ID del usuario que envió la solicitud

        // Verifica que los IDs estén presentes
        if (!senderId) {
            return res.status(400).json({ message: "Se requiere el ID del remitente" });
        }

        // Busca al usuario actual y al remitente
        const user = await User.findById(userId);
        const sender = await User.findById(senderId);

        // Verifica que ambos usuarios existan
        if (!user || !sender) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Verifica que la solicitud de amistad exista usando equals para ObjectId
        const solicitudExistente = user.solicitudesAmistadRecibidas.some(id => id.equals(senderId));
        if (!solicitudExistente) {
            return res.status(400).json({ message: "No hay solicitud de amistad pendiente de este usuario" });
        }

        // Elimina la solicitud de las listas usando el método correcto para ObjectId
        user.solicitudesAmistadRecibidas = user.solicitudesAmistadRecibidas.filter(id => !id.equals(senderId));
        sender.solicitudesAmistadEnviadas = sender.solicitudesAmistadEnviadas.filter(id => !id.equals(userId));

        // Agrega a ambos usuarios como amigos
        user.amigos.push(senderId);
        sender.amigos.push(userId);

        await user.save();
        await sender.save();

        res.status(200).json({ message: "Solicitud de amistad aceptada" });
    } catch (error) {
        console.error("Error en acceptFriendRequest:", error);
        res.status(500).json({ message: "Error al aceptar la solicitud", error: error.message });
    }
};

const rejectFriendRequest = async (req, res) => {
    try {
        const userId = req.user.id; // Usuario que rechaza la solicitud
        const { senderId } = req.body; // Usuario que envió la solicitud

        if (!senderId) {
            return res.status(400).json({ message: "Se requiere el ID del remitente" });
        }

        const user = await User.findById(userId);
        const sender = await User.findById(senderId);

        if (!user || !sender) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Verifica si la solicitud existe
        if (!user.solicitudesAmistadRecibidas.some(id => id.equals(senderId))) {
            return res.status(400).json({ message: "No hay solicitud de amistad pendiente de este usuario" });
        }

        // Elimina la solicitud de las listas
        user.solicitudesAmistadRecibidas = user.solicitudesAmistadRecibidas.filter(id => !id.equals(senderId));
        sender.solicitudesAmistadEnviadas = sender.solicitudesAmistadEnviadas.filter(id => !id.equals(userId));

        // Registra el rechazo en la lista
        user.solicitudesAmistadRechazadas.push(senderId);

        await user.save();
        await sender.save();

        res.status(200).json({ message: "Solicitud de amistad rechazada" });
    } catch (error) {
        console.error("Error en rejectFriendRequest:", error);
        res.status(500).json({ message: "Error al rechazar la solicitud", error: error.message });
    }
};

module.exports = { editProfile, searchFriends, blockUser, getProfile, deleteProfile, addFriend, removeFriend, rejectFriendRequest, acceptFriendRequest };