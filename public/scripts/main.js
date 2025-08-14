document.addEventListener('DOMContentLoaded', () => {
    const productContainer = document.getElementById('product-container');
    const paginationLinks = document.querySelectorAll('.pagination a');

    // Función para cargar productos de una página
    async function loadProducts(page) {
        // Muestra un mensaje de carga mientras se obtienen los datos
        productContainer.innerHTML = '<p aria-busy="true">Cargando peluches...</p>';

        try {
            // Usa el API de fetch para pedir los productos sin recargar la página
            const response = await fetch(`/api/products?page=${page}`);
            const html = await response.text();
            productContainer.innerHTML = html;
        } catch (error) {
            productContainer.innerHTML = '<p>Error al cargar los peluches. Intenta de nuevo.</p>';
        }
    }

    // Cargar la primera página cuando el sitio se carga por primera vez
    loadProducts(1);

    // Añadir un "escuchador" a cada botón de paginación
    paginationLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Evita que la página se recargue

            const page = e.target.dataset.page;

            // Quita la clase 'active' del botón anterior
            document.querySelector('.pagination a.active').classList.remove('active');
            // Añade la clase 'active' al botón que se hizo clic
            e.target.classList.add('active');

            // Carga los productos de la nueva página
            loadProducts(page);
        });
    });
});