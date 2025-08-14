const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const xss = require('xss');
const Culqi = require('culqi-node');
const app = express();
const port = 3000;

const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
const myCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 }); // Caché de 1 hora

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Máximo 100 solicitudes por IP
    message: 'Demasiadas solicitudes desde esta IP, por favor intenta de nuevo más tarde.',
});

const checkoutLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 5, // Máximo 5 solicitudes por IP en un minuto
    message: 'Demasiados intentos de pago. Por favor espera un momento e inténtalo de nuevo.',
});

// Configuración de la conexión a la base de datos
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '', // ¡Importante: cambia esto!
    database: 'tienda_peluches'
};

// Reemplaza esto con una clave de mentira
const CULQI_SECRET_KEY = 'sk_test_tu_clave_secreta';
// Inicializar Culqi (con una clave ficticia)
const culqi = new Culqi({ privateKey: CULQI_SECRET_KEY });

// Middleware para leer cookies y manejar sesiones
app.use(cookieParser());
app.use(session({
    secret: 'mi_secreto_super_seguro_e_impredecible', // CAMBIA ESTO
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false
    }
}));

// Protección CSRF
const csrfProtection = csurf({ cookie: true });

// Middleware para procesar datos de formularios
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // Para manejar respuestas JSON

// Middleware global para sanitizar la entrada del usuario (protección XSS)
app.use((req, res, next) => {
    if (req.body) {
        for (const key in req.body) {
            req.body[key] = xss(req.body[key]);
        }
    }
    next();
});

// Aplica el limitador a la API y el checkout
app.use('/api/', apiLimiter);
app.use('/checkout', checkoutLimiter);

// Ruta de API para obtener solo los productos de una página específica
app.get('/api/products', async (req, res) => {
    try {
       
        const page = parseInt(req.query.page) || 1;
        const cacheKey = `products_${page}`;

        // Intentar obtener de la caché
        let productsHtml = myCache.get(cacheKey);

        if (productsHtml) {
            console.log(`Respondiendo desde la caché para la página ${page}`);
            return res.send(productsHtml);
        }

         // Si no está en la caché, consultar la base de datos
        console.log(`Consultando DB para la página ${page}`);
        const connection = await mysql.createConnection(dbConfig);
        const limit = 10;
        const offset = (page - 1) * limit;

        const [rows] = await connection.execute('SELECT id, nombre, precio, imagen_url, stock FROM productos LIMIT ? OFFSET ?', [limit, offset]);
        connection.end();

        productsHtml = '';
        rows.forEach(product => {
            productsHtml += `
            <div class="product-card">
                <img src="${product.imagen_url}" alt="Peluche de ${product.nombre}" class="product-image">
                <h3 class="product-name">${product.nombre}</h3>
                <p class="product-price">S/${product.precio}</p>
                <div class="product-actions">
                    <input type="number" class="product-quantity" value="1" min="1" max="${product.stock}">
                    <button class="add-to-cart" data-product-id="${product.id}" data-product-name="${product.nombre}" data-product-price="${product.precio}" data-product-image="${product.imagen_url}" data-product-stock="${product.stock}">
                        Agregar
                    </button>
                </div>
            </div>
            `;
        });

        // Guardar el resultado en la caché
        myCache.set(cacheKey, productsHtml);
        res.send(productsHtml);

    } catch (error) {
        console.error('Error en la API de productos:', error);
        res.status(500).send('Hubo un error en el servidor.');
    }
});

        

// Ruta principal que sirve la página HTML completa
app.get('/', csrfProtection, async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const limit = 10;
        const [totalRows] = await connection.execute('SELECT COUNT(*) AS total FROM productos');
        const totalProducts = totalRows[0].total;
        const totalPages = Math.ceil(totalProducts / limit);
        connection.end();

        let paginationHtml = '<div class="pagination">';
        for (let i = 1; i <= totalPages; i++) {
            const activeClass = i === 1 ? 'class="active"' : '';
            paginationHtml += `<a href="#" data-page="${i}" ${activeClass}>${i}</a>`;
        }
        paginationHtml += '</div>';

        const csrfToken = req.csrfToken();

        const html = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Tienda de Peluches</title>
            <meta name="description" content="Encuentra los peluches más adorables y suaves en nuestra tienda.">

    <meta property="og:title" content="Tienda de Peluches - Los mejores y más suaves">
    <meta property="og:description" content="Peluche de alta calidad para todas las edades. ¡Descubre tu favorito!">
    <meta property="og:image" content="https://tu-dominio.com/images/peluche-destacado.jpg">
    <meta property="og:url" content="https://tu-dominio.com/">
    <meta property="og:type" content="website">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Tienda de Peluches - Calidad y Suavidad">
    <meta name="twitter:description" content="Elige entre una gran variedad de peluches adorables para regalar o coleccionar.">
    <meta name="twitter:image" content="https://tu-dominio.com/images/peluche-destacado.jpg">
           <link
             rel="stylesheet"
             href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"
           >
            <link rel="stylesheet" href="/css/style.css">
        </head>
        <body>
            <main class="container">
                <h1 style="text-align: center;">Nuestra tienda de peluches</h1>
                <div class="product-container" id="product-container">
                    <p aria-busy="true">Cargando peluches...</p>
                </div>
                ${paginationHtml}
            </main>
            <a href="/cart" class="cart-icon">
                <span class="cart-icon-text">🛒</span>
                <span class="badge" id="cart-count">0</span>
            </a>
            <script src="/scripts/main.js"></script>
            <script src="/scripts/cart.js"></script>
        </body>
        </html>
        `;
        res.send(html);
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).send('Hubo un error en el servidor.');
    }
});

// Ruta para la página del carrito
app.get('/cart', csrfProtection, (req, res) => {
    const csrfToken = req.csrfToken();
    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mi Carrito de Compras</title>
       <link
         rel="stylesheet"
         href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"
       >
        <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
        <main class="container">
            <h1 style="text-align: center;">Mi Carrito de Compras</h1>
            <div id="cart-items">
                </div>
            <div class="cart-total" id="cart-total"></div>

            <a href="/" role="button" style="margin-top: 20px;">Volver a la tienda</a>

            <hr>

            <div id="payment-response-container">
                </div>

            <form id="checkout-form" method="POST">
                <input type="hidden" name="_csrf" value="${csrfToken}">
                <input type="hidden" name="total_amount" id="total-amount-input">
                <hr>
                <h3 style="text-align: center;">Información de pago</h3>
                
                <label for="card_number">Número de tarjeta</label>
                <input type="text" id="card_number" name="card_number" data-culqi="card[number]" placeholder="Ej: 4111 1111 1111 1111" minlength="16" maxlength="19" pattern="[0-9 ]+" required>

                <label for="email">Email</label>
                <input type="email" id="email" name="email" data-culqi="card[email]" placeholder="Ej: prueba@ejemplo.com" maxlength="100" required>

                <div style="display: flex; gap: 1rem;">
                    <div>
                        <label for="card_exp">Fecha de Vencimiento (MM/AA)</label>
                        <input type="text" id="card_exp" name="card_exp" data-culqi="card[expiration_date]" placeholder="MM/AA" pattern="(0[1-9]|1[0-2])\/[0-9]{2}" required>
                    </div>
                    <div>
                        <label for="card_cvv">CVV</label>
                        <input type="text" id="card_cvv" name="card_cvv" data-culqi="card[cvv]" placeholder="123" required minlength="3" maxlength="4" pattern="[0-9]{3,4}">
                    </div>
                </div>
                
                <br>
                <button type="submit" role="button" id="pay-button">Pagar</button>
            </form>
        </main>
        <script src="/scripts/cart.js"></script>
        <script src="/scripts/cartPage.js"></script>
    </body>
    </html>
    `;
    res.send(html);
});

app.post('/checkout', csrfProtection, async (req, res) => {
    const { token_id, total_amount, email, cart_data } = req.body;

    if (!token_id || !total_amount || !cart_data || !email) {
        return res.status(400).json({ success: false, message: 'Faltan datos de pago.' });
    }
    
    // Convertir el JSON del carrito a un objeto
    const cart = JSON.parse(cart_data);

    if (token_id === 'tok_test_exitoso') {
        const payload = {
            amount: Math.round(total_amount * 100),
            currency_code: 'PEN',
            email: email,
            source_id: token_id,
        };

        let connection;
        try {
            // SIMULACIÓN: En un proyecto real, se haría la llamada a la API de Culqi.
            const simulatedCharge = {
                id: 'chg_test_exitoso_' + Date.now(),
                outcome: {
                    merchant_message: 'La venta ha sido exitosa.'
                }
            };
            
            connection = await mysql.createConnection(dbConfig);
            await connection.beginTransaction(); // Iniciar una transacción para asegurar la consistencia

            // 1. Insertar el registro en la tabla de pedidos
            const [pedidoResult] = await connection.execute(
                'INSERT INTO pedidos (fecha, total, estado, transaccion_id, email_cliente) VALUES (?, ?, ?, ?, ?)',
                [new Date(), total_amount, 'pagado', simulatedCharge.id, email]
            );

            const pedidoId = pedidoResult.insertId;

            // 2. Iterar sobre el carrito e insertar cada producto en detalles_pedido
            for (const productId in cart) {
                const item = cart[productId];
                await connection.execute(
                    'INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
                    [pedidoId, productId, item.quantity, item.price]
                );
            }
            
            await connection.commit(); // Confirmar la transacción

            res.json({ success: true, message: 'Pago exitoso', redirect: '/gracias' });

        } catch (error) {
            if (connection) {
                await connection.rollback(); // Si algo falla, deshacer todos los cambios
            }
            console.error('Error simulando el cargo o guardando el pedido:', error);
            res.status(500).json({ success: false, message: 'Hubo un error al procesar el pago. Inténtalo de nuevo.' });
        } finally {
            if (connection) {
                connection.end();
            }
        }
    } else {
        res.status(402).json({ success: false, message: 'Hubo un error con la tarjeta. Inténtalo con una tarjeta de prueba exitosa.' });
    }
});


// NUEVA RUTA: Página de agradecimiento
app.get('/gracias', (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gracias por tu compra</title>
        <link
                 rel="stylesheet"
                 href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"
               >
        <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
        <main class="container">
            <h1 style="text-align: center;">¡Gracias por tu compra!</h1>
            <p style="text-align: center;">Tu pedido ha sido procesado exitosamente. Recibirás un correo electrónico de confirmación pronto.</p>
            <div style="text-align: center; margin-top: 2rem;">
                <a href="/" role="button">Volver a la tienda</a>
            </div>
        </main>
    </body>
    </html>
    `;
    res.send(html);
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});