const Page = require('../Models/page.model');
const User = require('../Models/user.model');

// Crear página
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
        // Verificar si la página existe
        const page = await Page.findById(pageId);
        if (!page) {
            return res.status(404).json({ message: 'Página no encontrada' });
        }

        // Verificar si el usuario ya sigue la página
        if (page.seguidores.includes(userId)) {
            return res.status(400).json({ message: 'Ya sigues esta página' });
        }

        // Agregar el usuario a la lista de seguidores de la página
        page.seguidores.push(userId);
        await page.save();

        // Agregar la página a la lista de páginas seguidas del usuario
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
    try {
        const pages = await Page.find().populate('administrador', 'nombre avatar');
        res.status(200).json(pages);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

module.exports = { createPage, followPage, getPages, editPage };