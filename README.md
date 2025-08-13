# 🧸 Tienda de Peluches

Tienda de peluches online desarrollada con Node.js, Express y MySQL, que simula un flujo de e-commerce completo.

## 🚀 Características principales

- **Paginación dinámica:** Muestra productos de forma organizada y carga nuevas páginas sin recargar.
- **Carrito de compras:** Funcionalidad completa del carrito, permitiendo agregar, eliminar y ajustar la cantidad de productos.
- **Validación de stock:** El sistema gestiona el stock de productos, evitando que los usuarios agreguen más unidades de las disponibles.
- **Proceso de pago simulado:** Integración con pasarela de pago para simular transacciones con tarjetas de prueba (exitosas y fallidas).
- **Seguridad:** Implementación de medidas de seguridad esenciales, como protección **CSRF** (Cross-Site Request Forgery) y **XSS** (Cross-Site Scripting), y prevención de **SQL Injection**.
- **Registro de pedidos:** Guarda los detalles de cada compra en la base de datos (pedidos y detalles de pedido) para un registro completo de las transacciones.
- **Optimización de rendimiento:** Uso de caché para consultas frecuentes a la base de datos, mejorando la velocidad de la API.
- **Experiencia de Usuario (UX):** Vacía el carrito automáticamente después de un pago exitoso y redirige al usuario a una página de confirmación.

## 🛠️ Tecnologías utilizadas

- **Backend:**
    - Node.js
    - Express.js
    - MySQL (`mysql2/promise`)
    - Express Session (`express-session`)
    - CSURF (`csurf`)
    - XSS (`xss`)
    - Node-Cache (`node-cache`)
    - Express Rate Limit (`express-rate-limit`)
- **Frontend:**
    - JavaScript
    - HTML
    - CSS
    - Pico.css (framework ligero de CSS)

## 📦 Cómo empezar

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/santiagourdaneta/tienda-de-peluches/
    cd tienda-de-peluches
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar la base de datos MySQL:**
    - Crea una base de datos llamada `tienda_peluches`.
    - Ejecuta las siguientes consultas SQL para crear las tablas y insertar datos de ejemplo:
    ```sql
    -- Tabla de productos
    CREATE TABLE productos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        precio DECIMAL(10, 2) NOT NULL,
        imagen_url VARCHAR(255),
        stock INT NOT NULL
    );

    -- Datos de ejemplo
    INSERT INTO productos (nombre, descripcion, precio, imagen_url, stock) VALUES
    ('Oso de Peluche Marrón', 'Un clásico oso de peluche marrón, suave y abrazable.', 25.50, '/images/oso-marron.jpg', 15),
    ('Elefante de Peluche Gris', 'Un adorable elefante de peluche con grandes orejas.', 30.00, '/images/elefante-gris.jpg', 10),
    ('Conejo de Peluche Blanco', 'Suave conejo de peluche ideal para los más pequeños.', 18.75, '/images/conejo-blanco.jpg', 20),
    ('Peluche de Gato Negro', 'Un misterioso y tierno gato de peluche de color negro.', 22.00, '/images/gato-negro.jpg', 8),
    ('Unicornio de Peluche', 'Un mágico unicornio de peluche con cuerno brillante.', 35.99, '/images/unicornio.jpg', 12),
    ('Peluche de Zorro Rojo', 'Un peluche astuto y esponjoso con cola de zorro.', 27.50, '/images/zorro-rojo.jpg', 7),
    ('Panda de Peluche', 'Un adorable panda de peluche, perfecto para abrazar.', 32.25, '/images/panda.jpg', 18),
    ('León de Peluche', 'Un valiente león de peluche, el rey de la selva.', 40.00, '/images/leon.jpg', 5),
    ('Koala de Peluche', 'Un tierno koala de peluche, con grandes orejas y nariz.', 28.99, '/images/koala.jpg', 14),
    ('Peluche de Jirafa', 'Una simpática jirafa de peluche de cuello largo.', 31.50, '/images/jirafa.jpg', 9);

    -- Tabla de pedidos
    CREATE TABLE pedidos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fecha DATETIME NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        estado VARCHAR(50) NOT NULL,
        transaccion_id VARCHAR(255) NOT NULL,
        email_cliente VARCHAR(255) NOT NULL
    );

    -- Tabla de detalles del pedido
    CREATE TABLE detalles_pedido (
        id INT AUTO_INCREMENT PRIMARY KEY,
        pedido_id INT NOT NULL,
        producto_id INT NOT NULL,
        cantidad INT NOT NULL,
        precio_unitario DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
        FOREIGN KEY (producto_id) REFERENCES productos(id)
    );
    ```

4.  **Iniciar el servidor:**
    ```bash
    npm start
    ```
    El servidor se ejecutará en `http://localhost:3000`.

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

Labels y Tags: e-commerce, nodejs, express, mysql, javascript, web-development, cart, database, store
Hashtags: #NodeJS #ExpressJS #MySQL #Ecommerce #JavaScript #WebDev #Peluches #TiendaOnline

