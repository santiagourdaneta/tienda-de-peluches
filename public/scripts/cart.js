// public/scripts/cart.js
document.addEventListener('DOMContentLoaded', () => {
    const cartCountSpan = document.getElementById('cart-count');
    const productContainer = document.getElementById('product-container');

    let cart = JSON.parse(localStorage.getItem('cart')) || {};

    function updateCartCount() {
        if (cartCountSpan) {
            const count = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
            cartCountSpan.textContent = count;
        }
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }

    if (productContainer) {
        productContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                const button = e.target;
                const parent = button.closest('.product-card');
                const quantityInput = parent.querySelector('.product-quantity');
                const id = button.dataset.productId;
                const name = button.dataset.productName;
                const price = parseFloat(button.dataset.productPrice);
                const imageUrl = button.dataset.productImage;
                const stock = parseInt(button.dataset.productStock);
                const quantityToAdd = parseInt(quantityInput.value);

                if (quantityToAdd > 0) {
                    if (cart[id]) {
                        const newQuantity = cart[id].quantity + quantityToAdd;
                        if (newQuantity <= stock) {
                            cart[id].quantity = newQuantity;
                        } else {
                            alert(`No puedes agregar esa cantidad. Solo quedan ${stock} unidades.`);
                            return;
                        }
                    } else {
                        if (quantityToAdd <= stock) {
                            cart[id] = { name, price, imageUrl, stock, quantity: quantityToAdd };
                        } else {
                            alert(`No puedes agregar esa cantidad. Solo quedan ${stock} unidades.`);
                            return;
                        }
                    }
                    saveCart();
                   // alert(`Se agregaron ${quantityToAdd} unidad(es) de "${name}" al carrito.`);
                } else {
                    alert('La cantidad debe ser mayor a 0.');
                }
            }
        });
    }

    window.cart = cart;
    window.saveCart = saveCart;
    window.updateCartCount = updateCartCount;

    updateCartCount();
});