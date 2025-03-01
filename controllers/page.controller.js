const Page = require('../Models/page.model');
const User = require('../Models/user.model');

// Creación de página
const createPage = async (req, res) => {
    const { nombre, descripcion } = req.body;
    const userId = req.user.id;

    try {
        const page = new Page({ nombre, descripcion, administrador: userId });
        await page.save();
        res.status(201).json(page);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

const editPage = async (req, res) => {
    const { pageId } = req.params;
    const { nombre, descripcion } = req.body;
    const userId = req.user.id;

    try {
        const page = await Page.findOne({ _id: pageId, administrador: userId });

        if (!page) {
            return res.status(404).json({ message: 'Página no encontrada o no tienes permisos' });
        }

        page.nombre = nombre || page.nombre;
        page.descripcion = descripcion || page.descripcion;

        await page.save();
        res.status(200).json(page);
    } catch (error) {
        console.error("Error en editPage:", error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Seguir página
const followPage = async (req, res) => {
    const { pageId } = req.params;
    const userId = req.user.id;

    console.log("ID de la página:", pageId);
    console.log("ID del usuario:", userId);

    try {
        // Verifica si la página existe
        const page = await Page.findById(pageId);
        if (!page) {
            return res.status(404).json({ message: 'Página no encontrada' });
        }

        // Verifica si el usuario ya sigue la página
        if (page.seguidores.includes(userId)) {
            return res.status(400).json({ message: 'Ya sigues esta página' });
        }

        // Agrega el usuario a la lista de seguidores de la página
        page.seguidores.push(userId);
        await page.save();

        // Agrega la página a la lista de páginas seguidas del usuario
        const user = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { paginasSeguidas: pageId } },
            { new: true }
        );

        console.log("Página actualizada:", page);
        console.log("Usuario actualizado:", user);
        res.status(200).json({ page, user });
    } catch (error) {
        console.error("Error en followPage:", error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// Ver páginas
const getPages = async (req, res) => {
    const userId = req.user.id; // ID del usuario autenticado

    try {
        // Obtiene las páginas que el usuario no sigue
        const user = await User.findById(userId).select('paginasSeguidas');
        const pagesFollowed = user.paginasSeguidas || [];

        const pages = await Page.find({ _id: { $nin: pagesFollowed } }) // Excluye páginas que el usuario ya sigue
            .populate('administrador', 'nombre avatar');

        res.status(200).json(pages);
    } catch (error) {
        console.error("Error en getPages:", error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

module.exports = { createPage, followPage, getPages, editPage };