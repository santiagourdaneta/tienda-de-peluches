// Seeder.js
const mysql = require('mysql2/promise');
const axios = require('axios'); // Para hacer peticiones a la API de imágenes
const animals = [
    'ballena', 'delfin', 'carnero', 'toro', 'ciempies', 'alacran', 'leon', 'rana', 'perico',
    'raton', 'aguila', 'tigre', 'gato', 'caballo', 'mono', 'paloma', 'zorro', 'oso',
    'pavo', 'burro', 'chivo', 'cerdo', 'gallo', 'camello', 'cebra', 'iguana', 'gallina',
    'vaca', 'perro', 'zamuro', 'elefante', 'caiman', 'lapa', 'ardilla', 'pescado',
    'venado', 'jirafa', 'culebra'
];

async function seedProducts() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'tienda_peluches'
    });

    for (const animal of animals) {
        const precio = (Math.random() * (50 - 10) + 10).toFixed(2); // Precio entre 10 y 50
        const stock = Math.floor(Math.random() * (100 - 1) + 1); // Stock entre 1 y 100
        let imagenUrl = null;

        // Búsqueda de imagen en la API de Pexels
        try {
            const response = await axios.get(`https://api.pexels.com/v1/search?query=plush toy ${animal}`, {
                headers: {
                    'Authorization': '3C1e8ysYnMXnXs9OXUpMxHDuiTy2GwSpmqhDZnLn3F8jAYPY5rkvEeoD' // Debes obtener una clave de API gratuita
                }
            });
            if (response.data.photos.length > 0) {
                imagenUrl = response.data.photos[0].src.medium; // Obtiene la URL de la primera imagen
            }
        } catch (error) {
            console.error(`Error al buscar imagen para ${animal}:`, error.message);
        }

        const query = 'INSERT INTO productos (nombre, precio, stock, imagen_url) VALUES (?, ?, ?, ?)';
        await connection.execute(query, [`Peluche de ${animal}`, precio, stock, imagenUrl]);
    }

    console.log('Seeder de productos ejecutado correctamente.');
    await connection.end();
}

seedProducts();