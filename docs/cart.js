(() => {
// cart.js - Updated with proper payment handling
const userData = JSON.parse(localStorage.getItem('techstore_user'));
const username = userData?.username || 'guest';
let cart = [];

// Load cart on page load
document.addEventListener('DOMContentLoaded', function() {
    loadCartItems();
    updateCartTotal();
    setupEventListeners();
});

function setupEventListeners() {
    // Checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }

    // Payment method selection
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', switchPaymentMethod);
    });

    // Back to cart buttons
    setupBackToCartButtons();
    
    // Payment form submissions
    setupPaymentForms();
}

function loadCartItems() {
    cart = JSON.parse(localStorage.getItem(`techstore_cart_${username}`)) || [];
    console.log('loadCartItems called, cart =', cart);
    const cartContainer = document.getElementById('cart-products');
    if (!cartContainer) return;

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="empty-cart">Your cart is empty. <a href="products.html">Continue Shopping</a></p>';
        return;
    }

    cartContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image || 'images/generic.svg'}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover;">
            <div class="product-info">
                <h3>${item.name}</h3>
                <p class="price">₹${item.price.toLocaleString()}</p>
                <div class="quantity-controls">
                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                    <span class="quantity">Qty: ${item.quantity}</span>
                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="remove-btn" data-id="${item.id}">Remove</button>
        </div>
    `).join('');
    console.log("Cart UI rendered. Items:", cart.length);

    // Add event listeners for all buttons
    cartContainer.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            console.log("button clicked:", btn);
            const id = btn.dataset.id;
            const item = cart.find(item => item.id == id);
            if (item) {
                if (btn.classList.contains('minus')) {
                    updateQuantity(id, item.quantity - 1);
                } else {
                    updateQuantity(id, item.quantity + 1);
                }
            }
        });
    });

    cartContainer.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            console.log("button clicked:", btn);
            const id = btn.dataset.id;
            removeFromCart(id);
        });
    });
}

function updateQuantity(productId, newQuantity) {
    console.log("Updating quantity:", productId, "->", newQuantity);
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    const item = cart.find(item => item.id == productId);
    if (item) {
        item.quantity = newQuantity;
        localStorage.setItem(`techstore_cart_${username}`, JSON.stringify(cart));
        loadCartItems();
        updateCartTotal();
    }
}

function removeFromCart(productId) {
    console.log("Removing product from cart:", productId);
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem(`techstore_cart_${username}`, JSON.stringify(cart));
    loadCartItems();
    updateCartTotal();
}

function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartTotalElement = document.getElementById('cart-total');
    if (cartTotalElement) {
        cartTotalElement.textContent = `Total: ₹${total.toLocaleString()}`;
    }
    
    // Update payment summaries
    updatePaymentSummaries(total);
}

function updatePaymentSummaries(subtotal) {
    const shipping = 99;
    const tax = Math.round(subtotal * 0.18);
    const codCharges = 40;

    // Update all payment method summaries
    ['payment', 'upi', 'netbanking'].forEach(prefix => {
        const subtotalEl = document.getElementById(`${prefix}-subtotal`);
        const taxEl = document.getElementById(`${prefix}-tax`);
        const finalTotalEl = document.getElementById(`${prefix}-final-total`);
        
        if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString()}`;
        if (taxEl) taxEl.textContent = `₹${tax.toLocaleString()}`;
        if (finalTotalEl) finalTotalEl.textContent = `₹${(subtotal + shipping + tax).toLocaleString()}`;
    });

    // COD has additional charges
    const codSubtotalEl = document.getElementById('cod-subtotal');
    const codTaxEl = document.getElementById('cod-tax');
    const codFinalTotalEl = document.getElementById('cod-final-total');
    
    if (codSubtotalEl) codSubtotalEl.textContent = `₹${subtotal.toLocaleString()}`;
    if (codTaxEl) codTaxEl.textContent = `₹${tax.toLocaleString()}`;
    if (codFinalTotalEl) codFinalTotalEl.textContent = `₹${(subtotal + shipping + tax + codCharges).toLocaleString()}`;
}

function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    // Hide cart section and show payment section
    const cartSection = document.querySelector('.cart-items');
    const checkoutSection = document.querySelector('.checkout');
    const paymentSection = document.getElementById('payment-section');

    if (cartSection) cartSection.style.display = 'none';
    if (checkoutSection) checkoutSection.style.display = 'none';
    if (paymentSection) {
        paymentSection.classList.remove('hidden');
        paymentSection.style.display = 'block';
    }

    // Update payment totals
    updateCartTotal();
}

function switchPaymentMethod() {
    const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;
    
    // Hide all payment forms
    ['card-form', 'upi-form', 'netbanking-form', 'cod-form'].forEach(formId => {
        const form = document.getElementById(formId);
        if (form) form.classList.add('hidden');
    });

    // Show selected payment form
    const selectedForm = document.getElementById(`${selectedMethod}-form`);
    if (selectedForm) selectedForm.classList.remove('hidden');
}

function setupBackToCartButtons() {
    const backButtons = [
        'back-to-cart',
        'upi-back-to-cart', 
        'netbanking-back-to-cart',
        'cod-back-to-cart'
    ];

    backButtons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', backToCart);
        }
    });
}

function backToCart() {
    // Show cart section and hide payment section
    const cartSection = document.querySelector('.cart-items');
    const checkoutSection = document.querySelector('.checkout');
    const paymentSection = document.getElementById('payment-section');

    if (cartSection) cartSection.style.display = 'block';
    if (checkoutSection) checkoutSection.style.display = 'block';
    if (paymentSection) {
        paymentSection.classList.add('hidden');
        paymentSection.style.display = 'none';
    }
}

function setupPaymentForms() {
    // Card payment
    const cardForm = document.getElementById('payment-form');
    if (cardForm) {
        cardForm.addEventListener('submit', function(e) {
            e.preventDefault();
            processPayment('card');
        });
    }

    // UPI payment
    const upiForm = document.querySelector('.upi-payment-form');
    if (upiForm) {
        upiForm.addEventListener('submit', function(e) {
            e.preventDefault();
            processPayment('upi');
        });
    }

    // Net Banking
    const netbankingForm = document.querySelector('.netbanking-payment-form');
    if (netbankingForm) {
        netbankingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            processPayment('netbanking');
        });
    }

    // COD
    const codForm = document.querySelector('.cod-payment-form');
    if (codForm) {
        codForm.addEventListener('submit', function(e) {
            e.preventDefault();
            processPayment('cod');
        });
    }
}

function processPayment(paymentMethod) {
        // Show loading state
    const submitButton = document.querySelector(`#${paymentMethod === 'card' ? 'complete-payment' : paymentMethod + '-complete-payment'}`);
    if (submitButton) {
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Processing...';
        submitButton.disabled = true;

        // Simulate payment processing
        setTimeout(() => {
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;

            // Show success message
            showPaymentSuccess(paymentMethod);
        }, 2000);
    }
}

function showPaymentSuccess(paymentMethod) {
    const orderTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderId = 'TS' + Date.now(); // Generate simple order ID

    // Create order summary
    const orderSummary = {
        orderId: orderId,
        items: [...cart],
        total: orderTotal,
        paymentMethod: paymentMethod,
        date: new Date().toISOString()
    };

    // Order completion logged to console
    console.log('Order completed:', { orderId, orderTotal, paymentMethod });

    // Save order to localStorage (in real app, this would go to backend)
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(orderSummary);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Clear cart
    cart = [];
    localStorage.setItem('techstore_cart', JSON.stringify(cart));

    // Show success message
    alert(`🎉 Order Placed Successfully!\n\nOrder ID: ${orderId}\nTotal: ₹${orderTotal.toLocaleString()}\nPayment Method: ${paymentMethod.toUpperCase()}\n\nThank you for shopping with TechStore!`);

    // Redirect to products page
    window.location.href = 'products.html';
}

// Export functions for global access
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
})();