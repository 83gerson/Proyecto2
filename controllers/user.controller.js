const User = require('../Models/user.model');

// Editar perfil
const editProfile = async (req, res) => {
    const { nombre, biografia, avatar } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { nombre, biografia, avatar },
            { new: true }
        );
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Buscar amigos
const searchFriends = async (req, res) => {
    const { query } = req.query;

    try {
        const users = await User.find({ nombre: { $regex: query, $options: 'i' } });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Bloquear usuario
const blockUser = async (req, res) => {
    try {
        const userId = req.user.id; // ID del usuario que bloquea
        const { blockedUserId } = req.body; // ID del usuario a bloquear

        // Verificar que el ID del usuario a bloquear esté presente
        if (!blockedUserId) {
            return res.status(400).json({ message: "Se requiere el ID del usuario a bloquear" });
        }

        // Buscar al usuario actual
        const user = await User.findById(userId);

        // Verificar que el usuario exista
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Verificar que el usuario no esté ya bloqueado
        if (user.usuariosBloqueados.includes(blockedUserId)) {
            return res.status(400).json({ message: "El usuario ya está bloqueado" });
        }

        // Agregar al usuario a la lista de bloqueados
        user.usuariosBloqueados.push(blockedUserId);

        // Guardar los cambios
        await user.save();

        res.status(200).json({ message: "Usuario bloqueado" });
    } catch (error) {
        console.error("Error en blockUser:", error);
        res.status(500).json({ message: "Error al bloquear usuario", error: error.message });
    }
};

const addFriend = async (req, res) => {
    try {
        const userId = req.user.id;
        const { friendId } = req.body;

        console.log(`Usuario solicitante: ${userId}`);
        console.log(`ID del amigo: ${friendId}`);

        if (!friendId) {
            return res.status(400).json({ message: "Se requiere el ID del amigo" });
        }

        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        if (!friend) {
            return res.status(404).json({ message: "El usuario no existe" });
        }

        // Verificar si ya son amigos
        if (user.amigos.includes(friendId)) {
            return res.status(400).json({ message: "Ya son amigos" });
        }

        // Verificar si ya se envió una solicitud
        if (user.solicitudesAmistadEnviadas?.includes(friendId)) {
            return res.status(400).json({ message: "Solicitud ya enviada" });
        }

        // Verificar si el amigo ya tiene una solicitud pendiente
        if (friend.solicitudesAmistadRecibidas?.includes(userId)) {
            return res.status(400).json({ message: "El usuario ya tiene la solicitud pendiente" });
        }

        // Agregar solicitud de amistad
        user.solicitudesAmistadEnviadas.push(friendId);
        friend.solicitudesAmistadRecibidas.push(userId);

        await user.save();
        await friend.save();

        console.log("Solicitud de amistad enviada correctamente.");
        res.status(200).json({ message: "Solicitud enviada" });
    } catch (error) {
        console.error("Error en addFriend:", error);
        res.status(500).json({ message: "Error al enviar la solicitud", error: error.message });
    }
};


// Obtener perfil del usuario
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // Excluye la contraseña
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

        // Eliminar usuario de la base de datos
        await User.findByIdAndDelete(userId);

        res.status(200).json({ message: 'Perfil eliminado exitosamente' });
    } catch (error) {
        console.error("Error al eliminar el perfil:", error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
}

const removeFriend = async (req, res) => {
    try {
        const userId = req.user.id; // ID del usuario que elimina al amigo
        const { friendId } = req.body; // ID del amigo a eliminar

        // Verificar que el ID del amigo esté presente
        if (!friendId) {
            return res.status(400).json({ message: "Se requiere el ID del amigo" });
        }

        // Buscar al usuario actual y al amigo
        const user = await User.findById(userId);
        const friend = await User.findById(friendId);

        // Verificar que ambos usuarios existan
        if (!user || !friend) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Verificar que sean amigos
        if (!user.amigos.includes(friendId)) {
            return res.status(400).json({ message: "No son amigos" });
        }

        // Eliminar al amigo de ambas listas
        user.amigos = user.amigos.filter(id => id.toString() !== friendId);
        friend.amigos = friend.amigos.filter(id => id.toString() !== userId);

        // Guardar los cambios
        await user.save();
        await friend.save();

        res.status(200).json({ message: "Amigo eliminado" });
    } catch (error) {
        console.error("Error en removeFriend:", error);
        res.status(500).json({ message: "Error al eliminar amigo", error: error.message });
    }
};

const rejectFriendRequest = async (req, res) => {
    try {
        const userId = req.user.id; // ID del usuario que rechaza la solicitud
        const { senderId } = req.body; // ID del usuario que envió la solicitud

        // Verificar que el ID del remitente esté presente
        if (!senderId) {
            return res.status(400).json({ message: "Se requiere el ID del remitente" });
        }

        // Buscar al usuario actual y al remitente
        const user = await User.findById(userId);
        const sender = await User.findById(senderId);

        // Verificar que ambos usuarios existan
        if (!user || !sender) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Verificar que la solicitud de amistad exista
        if (!user.solicitudesAmistadRecibidas.includes(senderId)) {
            return res.status(400).json({ message: "No hay solicitud de amistad pendiente de este usuario" });
        }

        // Eliminar la solicitud de las listas
        user.solicitudesAmistadRecibidas = user.solicitudesAmistadRecibidas.filter(id => id.toString() !== senderId);
        sender.solicitudesAmistadEnviadas = sender.solicitudesAmistadEnviadas.filter(id => id.toString() !== userId);

        // Guardar los cambios
        await user.save();
        await sender.save();

        res.status(200).json({ message: "Solicitud de amistad rechazada" });
    } catch (error) {
        console.error("Error en rejectFriendRequest:", error);
        res.status(500).json({ message: "Error al rechazar la solicitud", error: error.message });
    }
};

const acceptFriendRequest = async (req, res) => {
    try {
        const userId = req.user.id; // ID del usuario que acepta la solicitud
        const { senderId } = req.body; // ID del usuario que envió la solicitud

        // Verificar que los IDs estén presentes
        if (!senderId) {
            return res.status(400).json({ message: "Se requiere el ID del remitente" });
        }

        // Buscar al usuario actual y al remitente
        const user = await User.findById(userId);
        const sender = await User.findById(senderId);

        // Verificar que ambos usuarios existan
        if (!user || !sender) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Verificar que la solicitud de amistad exista
        if (!user.solicitudesAmistadRecibidas.includes(senderId)) {
            return res.status(400).json({ message: "No hay solicitud de amistad pendiente de este usuario" });
        }

        // Eliminar la solicitud de las listas
        user.solicitudesAmistadRecibidas = user.solicitudesAmistadRecibidas.filter(id => id.toString() !== senderId);
        sender.solicitudesAmistadEnviadas = sender.solicitudesAmistadEnviadas.filter(id => id.toString() !== userId);

        // Agregar a ambos usuarios como amigos
        user.amigos.push(senderId);
        sender.amigos.push(userId);

        // Guardar los cambios
        await user.save();
        await sender.save();

        res.status(200).json({ message: "Solicitud de amistad aceptada" });
    } catch (error) {
        console.error("Error en acceptFriendRequest:", error);
        res.status(500).json({ message: "Error al aceptar la solicitud", error: error.message });
    }
};


module.exports = { editProfile, searchFriends, blockUser, getProfile, deleteProfile, addFriend, removeFriend, rejectFriendRequest, acceptFriendRequest };