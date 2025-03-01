const cron = require('node-cron');
const Post = require('../Models/post.model');
const Page = require('../Models/page.model');

const startCronJobs = () => {
    // Una nueva publicación cada minuto
    cron.schedule('* * * * *', async () => {
        try {
            // Obtiene una página aleatoria
            const page = await Page.findOne({ nombre: 'Noticias' });
            if (page) {
                const newPost = new Post({
                    contenido: `Publicación automática - ${new Date().toLocaleString()}`,
                    pagina: page._id,
                });
                await newPost.save();
                console.log('Nueva publicación automática creada.');
            }
        } catch (error) {
            console.error('Error en el cron job:', error);
        }
    });
};

module.exports = { startCronJobs };