// public/scripts/cartPage.js (Versión corregida y final)
document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const checkoutForm = document.getElementById('checkout-form');
    const totalAmountInput = document.getElementById('total-amount-input');
    const payButton = document.getElementById('pay-button');
    const responseContainer = document.getElementById('payment-response-container');

    function renderCartItems() {
        if (!cartItemsContainer || !cartTotalElement) return;

        cartItemsContainer.innerHTML = '';
        let total = 0;

        for (const id in window.cart) {
            const item = window.cart[id];
            total += item.price * item.quantity;

            const itemHtml = `
            <div class="cart-item">
                <img src="${item.imageUrl}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>S/${item.price.toFixed(2)} x ${item.quantity}</p>
                    <div class="quantity-controls">
                        <button class="quantity-change" data-id="${id}" data-change="-1">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-change" data-id="${id}" data-change="1">+</button>
                    </div>
                </div>
                <div>
                    <button class="remove-item" data-product-id="${id}">Eliminar</button>
                </div>
            </div>
            `;
            cartItemsContainer.innerHTML += itemHtml;
        }

        cartTotalElement.textContent = `Total: S/${total.toFixed(2)}`;
        if (totalAmountInput) {
            totalAmountInput.value = total.toFixed(2);
        }

        if (Object.keys(window.cart).length === 0) {
            cartItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
        }
    }

    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item')) {
                const id = e.target.dataset.productId;
                delete window.cart[id];
                window.saveCart();
                renderCartItems();
                window.updateCartCount();
            }

            if (e.target.classList.contains('quantity-change')) {
                const button = e.target;
                const id = button.dataset.id;
                const change = parseInt(button.dataset.change);
                const item = window.cart[id];

                if (item) {
                    const newQuantity = item.quantity + change;
                    if (newQuantity >= 1 && newQuantity <= item.stock) {
                        item.quantity = newQuantity;
                        window.saveCart();
                        renderCartItems();
                        window.updateCartCount();
                    } else if (newQuantity < 1) {
                        delete window.cart[id];
                        window.saveCart();
                        renderCartItems();
                        window.updateCartCount();
                    } else if (newQuantity > item.stock) {
                        alert(`No puedes agregar más. Solo quedan ${item.stock} en stock.`);
                    }
                }
            }
        });
    }

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (Object.keys(window.cart).length === 0) {
                alert('Tu carrito está vacío. No puedes procesar el pago.');
                return;
            }

            if (payButton) {
                payButton.disabled = true;
                payButton.textContent = 'Procesando...';
            }
            
            const csrfToken = document.querySelector('input[name="_csrf"]').value;
            const cardNumber = document.getElementById('card_number').value;
            const email = document.getElementById('email').value;
            const totalAmount = document.getElementById('total-amount-input').value;

            let token_id;
            if (cardNumber.endsWith('0')) {
                token_id = 'tok_test_exitoso';
            } else {
                token_id = 'tok_test_fallido';
            }
            
            const body = {
                token_id: token_id,
                email: email,
                total_amount: totalAmount,
                cart_data: JSON.stringify(window.cart)
            };

            try {
                const response = await fetch('/checkout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-csrf-token': csrfToken
                    },
                    body: JSON.stringify(body),
                });

                const result = await response.json();
                
                if (response.ok) {
                    if (result.redirect) {
                        // VACIADO EXPLÍCITO DEL CARRITO ANTES DE REDIRIGIR
                        window.localStorage.setItem('cart', '{}');
                        window.location.href = result.redirect;
                    }
                } else {
                    responseContainer.innerHTML = `<p style="color: red;">${result.message}</p>`;
                }
            } catch (error) {
                console.error('Error en el checkout:', error);
                responseContainer.innerHTML = `<p style="color: red;">Hubo un error al procesar tu pago. Inténtalo de nuevo.</p>`;
            } finally {
                if (payButton) {
                    payButton.disabled = false;
                    payButton.textContent = 'Pagar';
                }
            }
        });
        renderCartItems();
    }
});