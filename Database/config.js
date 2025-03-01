const mongoose = require('mongoose');

const connectToDatabase = async () => {
    const stringConnection = process.env.DB_CNN;

    if (!stringConnection) {
        console.error("Error: No se encontró la variable DB_CNN en el entorno.");
        return;
    }

    try {
        await mongoose.connect(stringConnection);
        console.info("Connected to Database");
    } catch (error) {
        console.error("Error al conectar a la base de datos:", error.message);
        throw new Error(error.message);
    }
}

module.exports = {
    connectToDatabase
}