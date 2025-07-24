// Toast Notification System
class ToastNotification {
    constructor() {
        this.createContainer();
    }

    createContainer() {
        if (!document.querySelector('.toast-container')) {
            const container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    }

    show(message, type = 'success', duration = 4000) {
        const container = document.querySelector('.toast-container');
        const toast = document.createElement('div');
        
        const icons = {
            success: '✅',
            info: 'ℹ️',
            warning: '⚠️',
            error: '❌'
        };

        toast.className = `toast toast-${type}`;
        toast.style.setProperty('--toast-duration', `${duration}ms`);
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${icons[type] || icons.success}</span>
                <span class="toast-message">${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;

        container.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);

        // Auto remove - match the progress bar duration exactly
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 400);
            }
        }, duration);

        return toast;
    }
}

// Initialize toast system
const toast = new ToastNotification();

/**
 * Function to get the current page name from URL
 * This is used throughout the script to determine which page we're on
 */
function getCurrentPageName() {
    // Get full path from window.location
    const path = window.location.pathname;
    
    // Extract the file name from the path
    const parts = path.split('/');
    const fileName = parts[parts.length - 1];
    
    return fileName || '';
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Hide any duplicate logout buttons in header
    const headerLogout = document.getElementById('header-logout');
    if (headerLogout) {
        headerLogout.style.display = 'none';
    }
    
    // Check if user is already logged in
    checkLoginStatus();
    
    // Setup login form handler
    setupLoginForm();
    
    // Initialize other components
    window.techStoreCart = new TechStoreCart();
    
    // Setup header user info (without logout button)
    displayHeaderUserInfo();
    
    // Setup product functionality
    setupImageErrorHandling();
    
    // Initialize products page if needed
    initializeProductsPage();
    
    // Setup category filters (moved to after initializeProductsPage)
    setTimeout(() => {
        setupCategoryFilters();
    }, 500);
    
    // Create top-right logout panel if user is logged in
    createTopRightLogoutPanel();
});

// Function to ensure proper page structure and alignment
function ensureProperPageStructure() {
    // Inject critical CSS for alignment if not present
    if (!document.querySelector('#alignment-styles')) {
        const style = document.createElement('style');
        style.id = 'alignment-styles';
        style.textContent = `
            /* Critical alignment styles */
            .page-container, .products-container, .cart-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 20px;
            }
            
            .products-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1.5rem;
                padding: 1rem 0;
            }
            
            .cart-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 1.5rem;
                margin-top: 1rem;
            }
            
            .category-section {
                margin-bottom: 3rem;
            }
            
            .category-filters {
                display: flex;
                justify-content: center;
                gap: 1rem;
                margin: 2rem 0;
                flex-wrap: wrap;
            }
            
            #login-section {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 60vh;
                padding: 2rem;
            }
            
            #hero-section {
                text-align: center;
                padding: 3rem 0;
            }
            
            @media (max-width: 768px) {
                .page-container, .products-container, .cart-container {
                    padding: 0 15px;
                }
                
                .products-grid {
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                }
                
                .cart-grid {
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                }
            }
            
            @media (max-width: 480px) {
                .page-container, .products-container, .cart-container {
                    padding: 0 10px;
                }
                
                .products-grid, .cart-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add container classes if missing
    const main = document.querySelector('main');
    if (main && !main.querySelector('.page-container')) {
        // Wrap main content in proper container only if needed
        const sections = main.querySelectorAll('section, div');
        let needsContainer = true;
        
        sections.forEach(section => {
            if (section.classList.contains('page-container') || 
                section.classList.contains('products-container') || 
                section.classList.contains('cart-container')) {
                needsContainer = false;
            }
        });
        
        if (needsContainer) {
            const existingContent = main.innerHTML;
            main.innerHTML = `<div class="page-container">${existingContent}</div>`;
        }
    }
    
    // Add proper classes to product grids
    const productGrids = document.querySelectorAll('#products-grid, [id*="products"]');
    productGrids.forEach(grid => {
        if (!grid.classList.contains('products-grid')) {
            grid.classList.add('products-grid');
        }
    });
    
    // Add proper classes to cart grids
    const cartGrids = document.querySelectorAll('#cart-products, [id*="cart"]');
    cartGrids.forEach(grid => {
        if (!grid.classList.contains('cart-grid')) {
            grid.classList.add('cart-grid');
        }
    });
    
    // Ensure category sections have proper styling
    const categorySections = document.querySelectorAll('[data-category="processors"], [data-category="graphics"], [data-category="memory"], [data-category="cooling"], [data-category="peripherals"]');
    categorySections.forEach(section => {
        if (section.tagName === 'SECTION' && !section.classList.contains('category-section')) {
            section.classList.add('category-section');
        }
    });
}

// Create simple top-right logout panel
function createTopRightLogoutPanel() {
    // Remove existing panel if any
    const existingPanel = document.getElementById('top-right-logout');
    if (existingPanel) existingPanel.remove();
    
    const loginData = JSON.parse(localStorage.getItem('techstore_user_login') || '{}');
    
    // Only show logout panel if user is logged in
    if (!loginData.isLoggedIn) return;
    
    const logoutPanel = document.createElement('div');
    logoutPanel.id = 'top-right-logout';
    logoutPanel.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(30, 30, 30, 0.95);
        border: 1px solid rgba(86, 156, 214, 0.3);
        border-radius: 8px;
        padding: 12px 16px;
        z-index: 1000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        color: #ffffff;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        backdrop-filter: blur(8px);
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 12px;
    `;
    
    logoutPanel.innerHTML = `
        <span style="color: #cccccc; font-weight: 500;">${loginData.name}</span>
        <button onclick="handleTopRightLogout()" style="
            background: linear-gradient(135deg, #d73a49, #c82333);
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 500;
            font-size: 13px;
            transition: all 0.2s ease;
        " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(215, 58, 73, 0.4)'" 
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
            Logout
        </button>
    `;
    
    document.body.appendChild(logoutPanel);
}

// Enhanced top-right logout handler
function handleTopRightLogout() {
    const loginData = JSON.parse(localStorage.getItem('techstore_user_login') || '{}');
    const userName = loginData.name || 'User';
    
    // Confirm logout
    if (!confirm(`Are you sure you want to logout, ${userName}?`)) {
        return;
    }
    
    // Clear login data
    localStorage.removeItem('techstore_user_login');
    
    // Show logout message
    toast.show(`Goodbye, ${userName}! You have been logged out successfully! 👋`, 'info', 3000);
    
    // Remove logout panel
    const panel = document.getElementById('top-right-logout');
    if (panel) panel.remove();
    
    // Handle page-specific logout behavior
    const currentPage = getCurrentPageName();
    
    if (currentPage === 'index.html' || currentPage === '') {
        // On homepage: show center login form again
        const centerLogin = document.getElementById('login-section');
        if (centerLogin) {
            centerLogin.classList.remove('hidden');
            centerLogin.style.display = 'block';
        }
        
        // Hide hero section
        const heroSection = document.getElementById('hero-section');
        if (heroSection) {
            heroSection.classList.add('hidden');
            heroSection.style.display = 'none';
        }
    } else {
        // On other pages: redirect to homepage after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
}

// Function to setup login form submission
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Validate form
            if (!name || !email || !password) {
                toast.show('Please fill in all fields', 'error', 3000);
                return;
            }
            
            // Create login data
            const loginTime = new Date().toLocaleString();
            const loginData = {
                name,
                email,
                loginTime,
                isLoggedIn: true
            };
            
            // Save login data
            localStorage.setItem('techstore_user_login', JSON.stringify(loginData));
            
            // Show success message
            toast.show(`Welcome, ${name}! Login successful.`, 'success', 3000);
            
            // Display user details (this will hide center login and show top-right user info)
            displayUserDetails(loginData, true);
            
            // Update header (without logout button) and create top-right logout panel
            displayHeaderUserInfo();
            createTopRightLogoutPanel();
        });
    }
}

// TechStore E-commerce Platform
// Custom shopping cart implementation

class TechStoreCart {
    constructor() {
        this.cartItems = JSON.parse(localStorage.getItem('techstore_cart')) || [];
        this.initialize();
    }

    initialize() {
        this.setupEventHandlers();
        this.updateCartDisplay();
        this.initializeProductButtons();
    }

    initializeProductButtons() {
        // Check if we're on the product page and restore quantity controls for items already in cart
        const currentFile = getCurrentPageName();
        if (currentFile.includes('product-local.html')) {
            const productCards = document.querySelectorAll('.product-card');
            productCards.forEach(card => {
                const name = card.querySelector('h4').textContent;
                const item = this.cartItems.find(item => item.name === name);
                if (item) {
                    this.replaceWithQuantityControls(card, name);
                }
            });
        }
    }

    setupEventHandlers() {
        // Add to cart buttons on products page
        this.attachEventListeners();

        // Checkout button
        const checkoutBtn = document.querySelector('#checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.showPaymentSection());
        }

        // Payment form handlers
        this.setupPaymentHandlers();

        // Initial cart rendering if on cart page
        const currentFile = getCurrentPageName();
        if (currentFile.includes('cart.html')) {
            this.renderCartItems();
            this.updateTotal();
        }
    }

    attachEventListeners() {
        // Handle Add to Cart buttons (product page) - prevent duplicate listeners
        document.querySelectorAll('.product-card button').forEach(button => {
            if (button.textContent.includes('Add to Cart') && !button.hasAttribute('data-listener-attached')) {
                button.addEventListener('click', (e) => this.addToCart(e));
                button.setAttribute('data-listener-attached', 'true');
            }
        });

        // Handle Remove buttons (cart page)
        this.attachRemoveListeners();
    }

    addToCart(event) {
        const productCard = event.target.closest('.product-card');
        const name = productCard.querySelector('h4').textContent;
        const price = productCard.querySelector('p').textContent;
        const imgElement = productCard.querySelector('img');
        const imgSrc = imgElement ? imgElement.src : '';
        const alt = imgElement ? imgElement.alt : name;

        // Determine category from product name for proper SVG fallback
        let category = 'generic';
        const productName = name.toLowerCase();
        
        if (productName.includes('ryzen') || productName.includes('intel') || productName.includes('cpu') || productName.includes('processor')) {
            category = 'processors';
        } else if (productName.includes('rtx') || productName.includes('gtx') || productName.includes('nvidia') || productName.includes('amd') || productName.includes('gpu') || productName.includes('graphics')) {
            category = 'graphics';
        } else if (productName.includes('ram') || productName.includes('memory') || productName.includes('ddr') || productName.includes('corsair') || productName.includes('kingston')) {
            category = 'memory';
        } else if (productName.includes('cooler') || productName.includes('fan') || productName.includes('cooling') || productName.includes('noctua') || productName.includes('arctic')) {
            category = 'cooling';
        } else if (productName.includes('keyboard') || productName.includes('mouse') || productName.includes('headset') || productName.includes('logitech') || productName.includes('razer')) {
            category = 'peripherals';
        }

        // Check if item already exists in cart
        const existingItem = this.cartItems.find(item => item.name === name);
        
        if (existingItem) {
            // Increase quantity if item exists
            existingItem.quantity = (existingItem.quantity || 1) + 1;
            toast.show(`${name} quantity increased! (${existingItem.quantity}) 🛒`, 'success', 3000);
        } else {
            // Add new item with quantity 1 and category
            const productItem = {
                id: Date.now() + Math.random(),
                name,
                price,
                imgSrc: imgSrc && imgSrc !== window.location.href ? imgSrc : '',
                alt,
                category: category, // Store category for cart display
                quantity: 1
            };
            
            this.cartItems.push(productItem);
            toast.show(`${name} added to cart! 🛒`, 'success', 3000);
        }

        this.saveCartData();
        
        // Replace button with quantity controls for this product
        this.replaceWithQuantityControls(productCard, name);
    }

    replaceWithQuantityControls(productCard, productName) {
        const button = productCard.querySelector('button');
        const item = this.cartItems.find(item => item.name === productName);
        
        if (item && button && !productCard.querySelector('.product-quantity-controls')) {
            button.outerHTML = `
                <div class="product-quantity-controls">
                    <button class="product-quantity-btn decrease-btn" data-product="${productName}">-</button>
                    <span class="product-quantity-display">${item.quantity || 1}</span>
                    <button class="product-quantity-btn increase-btn" data-product="${productName}">+</button>
                </div>
            `;
            
            // Attach new event listeners with a small delay to ensure DOM is updated
            setTimeout(() => {
                this.attachProductQuantityListeners();
            }, 100);
        }
    }

    attachProductQuantityListeners() {
        // Remove existing listeners first to prevent duplicates
        document.querySelectorAll('.product-quantity-btn').forEach(button => {
            // Clone the button to remove all event listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
        });
        
        // Attach fresh event listeners
        document.querySelectorAll('.product-quantity-btn').forEach(button => {
            button.addEventListener('click', (e) => this.handleProductQuantityChange(e));
        });
    }

    handleProductQuantityChange = (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        const productName = event.target.getAttribute('data-product');
        const isIncrease = event.target.classList.contains('increase-btn');
        const item = this.cartItems.find(item => item.name === productName);
        
        if (!item) return;

        const previousQuantity = item.quantity || 1;

        if (isIncrease) {
            item.quantity = previousQuantity + 1;
            toast.show(`${productName} quantity increased! (${item.quantity}) 🛒`, 'success', 2000);
        } else {
            if (previousQuantity > 1) {
                item.quantity = previousQuantity - 1;
                toast.show(`${productName} quantity decreased! (${item.quantity}) 🛒`, 'info', 2000);
            } else {
                // Remove item and restore Add to Cart button
                this.cartItems = this.cartItems.filter(cartItem => cartItem.name !== productName);
                toast.show(`${productName} removed from cart! 🗑️`, 'warning', 2000);
                this.restoreAddToCartButton(productName);
                this.saveCartData();
                return;
            }
        }

        // Update quantity display immediately
        const quantityDisplay = event.target.parentElement.querySelector('.product-quantity-display');
        if (quantityDisplay) {
            quantityDisplay.textContent = item.quantity;
        }

        this.saveCartData();
    }

    restoreAddToCartButton(productName) {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            const name = card.querySelector('h4').textContent;
            if (name === productName) {
                const quantityControls = card.querySelector('.product-quantity-controls');
                if (quantityControls) {
                    quantityControls.outerHTML = '<button>Add to Cart</button>';
                    // Re-attach event listener for the new button
                    this.attachEventListeners();
                }
            }
        });
    }

    removeFromCart(event) {
        const productCard = event.target.closest('.product-card');
        const itemId = productCard.getAttribute('data-item-id');
        
        if (itemId) {
            // Remove specific item by ID
            this.cartItems = this.cartItems.filter(item => item.id != itemId);
        } else {
            // Fallback: remove first item with matching name
            const name = productCard.querySelector('h4').textContent;
            const itemIndex = this.cartItems.findIndex(item => item.name === name);
            if (itemIndex > -1) {
                this.cartItems.splice(itemIndex, 1);
            }
        }
        
        this.saveCartData();
        this.updateCartDisplay();
        
        // Show toast notification
        toast.show(`Product removed from cart`);
    }

    saveCartData() {
        localStorage.setItem('techstore_cart', JSON.stringify(this.cartItems));
    }

    updateCartDisplay() {
        // Update cart page if we're on it
        const currentFile = getCurrentPageName();
        if (currentFile.includes('cart.html')) {
            this.renderCartItems();
            this.updateTotal();
        }
    }

    renderCartItems() {
        const productGrid = document.querySelector('#cart-products');
        if (!productGrid) return;

        if (this.cartItems.length === 0) {
            productGrid.innerHTML = '<p style="text-align: center; color: #569cd6; font-size: 1.2rem;">Your cart is empty!</p>';
            return;
        }

        productGrid.innerHTML = this.cartItems.map(item => {
            // Use CategoryDetector utility for category and SVG determination
            const category = CategoryDetector.detectCategory(item.name, item.category);
            const fallbackImage = CategoryDetector.getCategoryImage(category);
            
            return `
                <div class="product-card" data-item-id="${item.id}" data-category="${category}">
                    ${item.imgSrc && item.imgSrc !== 'undefined' && item.imgSrc !== '' ? 
                        `<img src="${item.imgSrc}" alt="${item.alt || item.name}" onerror="this.src='${fallbackImage}'" />` : 
                        `<img src="${fallbackImage}" alt="${item.name}" />`
                    }
                    <h4>${item.name}</h4>
                    <p>${item.price}</p>
                    <div class="quantity-controls">
                        <button class="quantity-btn decrease-btn" data-action="decrease">-</button>
                        <span class="quantity-display">Qty: ${item.quantity || 1}</span>
                        <button class="quantity-btn increase-btn" data-action="increase">+</button>
                    </div>
                    <button class="remove-btn">Remove Item</button>
                </div>
            `;
        }).join('');

        // Re-attach event listeners to new buttons
        this.attachRemoveListeners();
        this.attachQuantityListeners();
    }

    attachRemoveListeners() {
        // Add event listeners specifically for remove buttons in cart
        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', (e) => this.removeFromCart(e));
        });
    }

    attachQuantityListeners() {
        // Add event listeners for quantity control buttons
        document.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', (e) => this.updateQuantity(e));
        });
    }

    updateQuantity(event) {
        const productCard = event.target.closest('.product-card');
        const itemId = productCard.getAttribute('data-item-id');
        const action = event.target.getAttribute('data-action');
        
        const item = this.cartItems.find(item => item.id == itemId);
        if (!item) return;

        if (action === 'increase') {
            item.quantity = (item.quantity || 1) + 1;
            toast.show(`${item.name} quantity increased! (${item.quantity}) 🛒`, 'success', 2000);
        } else if (action === 'decrease') {
            if (item.quantity > 1) {
                item.quantity -= 1;
                toast.show(`${item.name} quantity decreased! (${item.quantity}) 🛒`, 'info', 2000);
            } else {
                // Remove item if quantity would become 0
                this.cartItems = this.cartItems.filter(cartItem => cartItem.id != itemId);
                toast.show(`${item.name} removed from cart! 🗑️`, 'warning', 2000);
            }
        }

        this.saveCartData();
        this.updateCartDisplay();
    }

    updateTotal() {
        const totalElement = document.querySelector('#cart-total');
        if (!totalElement) return;

        const total = this.cartItems.reduce((sum, item) => {
            const price = parseFloat(String(item.price).replace(/[₹$,]/g, '')) || 0;
            const quantity = item.quantity || 1;
            return sum + (price * quantity);
        }, 0);

        const totalItems = this.cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
        totalElement.textContent = `Total: ₹${total.toLocaleString()} (${totalItems} items)`;
    }

    showPaymentSection() {
        if (this.cartItems.length === 0) {
            toast.show('Your cart is empty! Add some items first 🛒', 'warning', 3000);
            return;
        }

        // Hide cart sections and show payment section
        const cartSection = document.querySelector('.cart-items');
        const checkoutSection = document.querySelector('.checkout');
        const paymentSection = document.querySelector('#payment-section');

        if (cartSection) cartSection.style.display = 'none';
        if (checkoutSection) checkoutSection.style.display = 'none';
        if (paymentSection) {
            paymentSection.style.display = 'block';
            this.updatePaymentSummary();
        }

        // Scroll to payment section
        paymentSection.scrollIntoView({ behavior: 'smooth' });
    }

    setupPaymentHandlers() {
        // Payment method selection
        document.addEventListener('change', (e) => {
            if (e.target.name === 'payment-method') {
                this.switchPaymentMethod(e.target.value);
            }
        });

        // Back to cart buttons for all payment methods
        const backButtons = ['#back-to-cart', '#upi-back-to-cart', '#netbanking-back-to-cart', '#cod-back-to-cart'];
        backButtons.forEach(selector => {
            const btn = document.querySelector(selector);
            if (btn) {
                btn.addEventListener('click', () => this.backToCart());
            }
        });

        // Payment form submissions for all methods
        const paymentForms = [
            { selector: '.card-payment-form', handler: (e) => this.processPayment(e) },
            { selector: '.upi-payment-form', handler: (e) => this.processUPIPayment(e) },
            { selector: '.netbanking-payment-form', handler: (e) => this.processNetBankingPayment(e) },
            { selector: '.cod-payment-form', handler: (e) => this.processCODPayment(e) }
        ];

        paymentForms.forEach(form => {
            const formElement = document.querySelector(form.selector);
            if (formElement) {
                formElement.addEventListener('submit', form.handler);
            }
        });

        // Input formatting
        this.setupInputFormatting();
    }

    switchPaymentMethod(method) {
        // Hide all payment forms
        const forms = ['card-form', 'upi-form', 'netbanking-form', 'cod-form'];
        forms.forEach(formId => {
            const form = document.querySelector(`#${formId}`);
            if (form) form.style.display = 'none';
        });

        // Show selected payment form
        const selectedForm = document.querySelector(`#${method}-form`);
        if (selectedForm) {
            selectedForm.style.display = 'block';
        }

        // Update summary for COD
        this.updatePaymentSummary(method === 'cod');
    }

    updatePaymentSummary(isCOD = false) {
        const subtotal = this.cartItems.reduce((sum, item) => {
            const price = parseFloat(String(item.price).replace(/[₹$,]/g, '')) || 0;
            const quantity = item.quantity || 1;
            return sum + (price * quantity);
        }, 0);

        const shipping = 99;
        const codCharges = isCOD ? 40 : 0;
        const tax = Math.round(subtotal * 0.18);
        const total = subtotal + shipping + codCharges + tax;

        // Update all payment summaries
        const summaryElements = [
            { prefix: 'payment', isCOD: false },
            { prefix: 'upi', isCOD: false },
            { prefix: 'netbanking', isCOD: false },
            { prefix: 'cod', isCOD: true }
        ];

        summaryElements.forEach(summary => {
            const currentTotal = summary.isCOD ? (subtotal + shipping + 40 + tax) : total;
            
            const subtotalEl = document.querySelector(`#${summary.prefix}-subtotal`);
            const taxEl = document.querySelector(`#${summary.prefix}-tax`);
            const totalEl = document.querySelector(`#${summary.prefix}-final-total`);

            if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toLocaleString()}`;
            if (taxEl) taxEl.textContent = `₹${tax.toLocaleString()}`;
            if (totalEl) totalEl.textContent = `₹${currentTotal.toLocaleString()}`;
        });

        // Update shipping display for COD in main payment section
        const shippingEl = document.querySelector('.summary-row:nth-child(2) span:last-child');
        if (shippingEl) {
            shippingEl.textContent = isCOD ? '₹139 (₹99 + ₹40 COD)' : '₹99';
        }
    }

    backToCart() {
        const cartSection = document.querySelector('.cart-items');
        const checkoutSection = document.querySelector('.checkout');
        const paymentSection = document.querySelector('#payment-section');

        if (cartSection) cartSection.style.display = 'block';
        if (checkoutSection) checkoutSection.style.display = 'block';
        if (paymentSection) paymentSection.style.display = 'none';

        // Scroll back to cart
        if (cartSection) {
            cartSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    processPayment(event) {
        event.preventDefault();
        
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
        const total = document.querySelector('#payment-final-total').textContent;

        // Simulate payment processing
        toast.show('Processing payment... 🔄', 'info', 2000);

        setTimeout(() => {
            toast.show(`Payment successful! Order confirmed for ${total} 🎉`, 'success', 4000);
            this.completeOrder(total, this.getPaymentMethodName(paymentMethod));
        }, 3000);
    }

    processUPIPayment(event) {
        event.preventDefault();
        
        const upiId = document.querySelector('#upi-id').value;
        const total = document.querySelector('#upi-final-total').textContent;

        if (!upiId) {
            toast.show('Please enter a valid UPI ID 📱', 'warning', 3000);
            return;
        }

        // Simulate UPI payment processing
        toast.show('Redirecting to UPI app... 📱', 'info', 2000);

        setTimeout(() => {
            toast.show(`UPI payment successful! Order confirmed for ${total} 🎉`, 'success', 4000);
            this.completeOrder(total, 'UPI Payment');
        }, 3000);
    }

    processNetBankingPayment(event) {
        event.preventDefault();
        
        const selectedBank = document.querySelector('#bank-select').value;
        const total = document.querySelector('#netbanking-final-total').textContent;

        if (!selectedBank) {
            toast.show('Please select your bank 🏦', 'warning', 3000);
            return;
        }

        // Simulate net banking payment processing
        toast.show('Redirecting to bank website... 🏦', 'info', 2000);

        setTimeout(() => {
            toast.show(`Net banking payment successful! Order confirmed for ${total} 🎉`, 'success', 4000);
            this.completeOrder(total, 'Net Banking');
        }, 3000);
    }

    processCODPayment(event) {
        event.preventDefault();
        
        const phone = document.querySelector('#cod-phone').value;
        const address = document.querySelector('#cod-address').value;
        const total = document.querySelector('#cod-final-total').textContent;

        if (!phone || !address) {
            toast.show('Please fill in contact number and delivery address 📦', 'warning', 3000);
            return;
        }

        if (phone.length !== 10) {
            toast.show('Please enter a valid 10-digit mobile number 📱', 'warning', 3000);
            return;
        }

        // Simulate COD order processing
        toast.show('Confirming COD order... 🚚', 'info', 2000);

        setTimeout(() => {
            toast.show(`COD order confirmed! Total: ${total} 🎉`, 'success', 4000);
            this.completeOrder(total, 'Cash on Delivery');
        }, 2000);
    }

    completeOrder(total, paymentMethod) {
        // Save order to payment history
        const order = this.saveOrderToHistory(total, paymentMethod);
        
        // Clear cart after successful payment
        this.cartItems = [];
        this.saveCartData();
        
        // Show receipt instead of redirecting
        setTimeout(() => {
            this.showReceipt(order);
        }, 2000);
    }

    saveOrderToHistory(total, paymentMethod) {
        const order = {
            id: 'ORD' + Date.now(),
            date: new Date().toLocaleString(),
            total: total,
            paymentMethod: paymentMethod,
            status: paymentMethod === 'Cash on Delivery' ? 'pending' : 'completed',
            items: [...this.cartItems], // Copy current cart items
            itemCount: this.cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
        };

        // Get existing order history
        const orderHistory = JSON.parse(localStorage.getItem('techstore_order_history') || '[]');
        
        // Add new order to the beginning of the array
        orderHistory.unshift(order);
        
        // Keep only last 10 orders to avoid storage issues
        if (orderHistory.length > 10) {
            orderHistory.splice(10);
        }
        
        // Save updated history
        localStorage.setItem('techstore_order_history', JSON.stringify(orderHistory));
        
        // Return the order for receipt display
        return order;
    }

    getPaymentMethodName(method) {
        const methods = {
            'card': 'Credit/Debit Card',
            'upi': 'UPI Payment',
            'netbanking': 'Net Banking',
            'cod': 'Cash on Delivery'
        };
        return methods[method] || method;
    }

    setupInputFormatting() {
        // Card number formatting
        const cardNumber = document.querySelector('#card-number');
        if (cardNumber) {
            cardNumber.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
                let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                e.target.value = formattedValue;
            });
        }

        // Expiry date formatting
        const expiryDate = document.querySelector('#expiry-date');
        if (expiryDate) {
            expiryDate.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value;
            });
        }

        // CVV formatting (numbers only)
        const cvv = document.querySelector('#cvv');
        if (cvv) {
            cvv.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
        }

        // Phone number formatting for COD
        const codPhone = document.querySelector('#cod-phone');
        if (codPhone) {
            codPhone.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
        }

        // PIN code formatting
        const pincode = document.querySelector('#billing-pincode');
        if (pincode) {
            pincode.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
        }
    }

    showReceipt(order) {
        // Hide all cart sections
        const cartSections = ['#cart-items-section', '#payment-section'];
        cartSections.forEach(selector => {
            const section = document.querySelector(selector);
            if (section) section.style.display = 'none';
        });

        // Create or show receipt section
        let receiptSection = document.querySelector('#receipt-section');
        if (!receiptSection) {
            receiptSection = document.createElement('section');
            receiptSection.id = 'receipt-section';
            receiptSection.className = 'receipt-section';
            
            // Try to append to main, fallback to body
            const mainElement = document.querySelector('main');
            if (mainElement) {
                mainElement.appendChild(receiptSection);
            } else {
                document.body.appendChild(receiptSection);
            }
        }

        // Generate receipt HTML
        const itemsList = order.items.map(item => `
            <div class="receipt-item">
                <span class="item-name">${item.name}</span>
                <span class="item-quantity">x${item.quantity || 1}</span>
                <span class="item-price">${item.price}</span>
            </div>
        `).join('');

        receiptSection.innerHTML = `
            <div class="receipt-container">
                <div class="receipt-header">
                    <h2>🧾 Order Receipt</h2>
                    <div class="receipt-status ${order.status}">
                        ${order.status === 'completed' ? '✅ Payment Confirmed' : '⏳ Payment Pending'}
                    </div>
                </div>
                
                <div class="receipt-details">
                    <div class="receipt-row">
                        <span class="label">Order ID:</span>
                        <span class="value">${order.id}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="label">Date & Time:</span>
                        <span class="value">${order.date}</span>
                    </div>
                    <div class="receipt-row">
                        <span class="label">Payment Method:</span>
                        <span class="value">${order.paymentMethod}</span>
                    </div>
                </div>

                <div class="receipt-items">
                    <h3>📦 Order Items</h3>
                    ${itemsList}
                </div>

                <div class="receipt-total">
                    <div class="total-row">
                        <span class="total-label">Total Amount:</span>
                        <span class="total-amount">${order.total}</span>
                    </div>
                </div>

                <div class="receipt-message">
                    <p>🎉 Thank you for shopping with TechStore!</p>
                    <p>Your order has been ${order.status}. You will receive an email confirmation shortly.</p>
                </div>

                <div class="receipt-actions">
                    <button class="btn" onclick="window.print()" style="background: #27ae60;">🖨️ Print Receipt</button>
                    <button class="btn" onclick="location.href='index.html'" style="background: #3498db;">🏠 Back to Home</button>
                    <button class="btn" onclick="location.href='products.html'" style="background: #e67e22;">🛍️ Continue Shopping</button>
                </div>
            </div>
        `;

        receiptSection.style.display = 'block';
        receiptSection.scrollIntoView({ behavior: 'smooth' });
        
        // Show a toast message as well
        toast.show('Receipt displayed successfully! 🧾', 'success', 3000);
    }
}

// Product Detail Modal Functions
function showProductDetail(productName, price, description, imageSrc) {
  const modal = document.getElementById('product-modal');
  const modalTitle = document.getElementById('modal-product-name');
  const modalPrice = document.getElementById('modal-product-price');
  const modalDescription = document.getElementById('modal-product-description');
  const modalImage = document.getElementById('modal-product-image');
  
  if (modal && modalTitle && modalPrice && modalDescription && modalImage) {
    modalTitle.textContent = productName;
    modalPrice.textContent = price;
    modalDescription.textContent = description;
    modalImage.src = imageSrc;
    modalImage.alt = productName;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }
}

function closeProductModal() {
  const modal = document.getElementById('product-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
  }
}

// Image Error Handling Function with categorized fallback images
function handleImageError(img) {
  // Get the product category from parent elements or product name
  const productCard = img.closest('.product-card');
  let category = 'generic';
  
  if (productCard) {
    // Try to get category from data attribute
    category = productCard.getAttribute('data-category');
    
    // If no data-category, try to determine from product name using CategoryDetector
    if (!category) {
      const productName = productCard.querySelector('h4, h3')?.textContent || '';
      category = CategoryDetector.detectCategory(productName);
    }
  }
  
  // Set the fallback image using CategoryDetector
  const fallbackImage = CategoryDetector.getCategoryImage(category);
  img.src = fallbackImage;
  img.alt = `${category} component`;
}

// Enhanced image error handling for product cards
function setupImageErrorHandling() {
  const images = document.querySelectorAll('.product-card img, #modal-product-image');
  images.forEach(img => {
    img.addEventListener('error', () => handleImageError(img));
    
    // Also handle if image src is empty or invalid
    if (!img.src || img.src === '' || img.src === window.location.href) {
      handleImageError(img);
    }
  });
}

// Cart class will be initialized by main DOMContentLoaded listener

// Login form handling will be managed by main DOMContentLoaded listener

// Function to display user details in top right only
function displayUserDetails(loginData, showHistory = false) {
    const loginSection = document.getElementById('login-section');
    const userDetailsSection = document.getElementById('user-details');
    const heroSection = document.getElementById('hero-section');

    // Hide center login form after successful login
    if (loginSection) {
        loginSection.classList.add('hidden');
        loginSection.style.display = 'none';
    }
    
    // Don't show user details in center - keep it hidden
    if (userDetailsSection) {
        userDetailsSection.classList.add('hidden');
        userDetailsSection.style.display = 'none';
    }
    
    // Show hero section with shopping options
    if (heroSection) {
        heroSection.classList.remove('hidden');
        heroSection.style.display = 'block';
    }
    
    // Create top-right logout panel (not updateTopRightPanel)
    createTopRightLogoutPanel();
    
    // Only show payment history if user has made orders
    if (showHistory) {
        const paymentHistory = new PaymentHistory();
        paymentHistory.displayPaymentHistory();
    }
}

// Function to update top-right panel with user info
function updateTopRightPanel(loginData) {
    // Remove any existing panel
    const existingPanel = document.getElementById('top-right-logout');
    if (existingPanel) existingPanel.remove();
    
    // Create new logout panel
    createTopRightLogoutPanel();
}

// Function to check login status on page load
function checkLoginStatus() {
    const loginData = JSON.parse(localStorage.getItem('techstore_user_login') || '{}');
    
    if (loginData.isLoggedIn) {
        // Hide center login and show only top-right user info
        const loginSection = document.getElementById('login-section');
        if (loginSection) {
            loginSection.classList.add('hidden');
            loginSection.style.display = 'none';
        }
        
        // Show hero section
        const heroSection = document.getElementById('hero-section');
        if (heroSection) {
            heroSection.classList.remove('hidden');
            heroSection.style.display = 'block';
        }
        
        // Create top-right logout panel
        createTopRightLogoutPanel();
    } else {
        // Show center login form
        const loginSection = document.getElementById('login-section');
        if (loginSection) {
            loginSection.classList.remove('hidden');
            loginSection.style.display = 'block';
        }
    }
}

// Function to handle logout
function handleLogout() {
    // Get user data before clearing
    const loginData = JSON.parse(localStorage.getItem('techstore_user_login') || '{}');
    const userName = loginData.name || 'User';
    
    // Clear login data
    localStorage.removeItem('techstore_user_login');
    
    // Hide header user info
    const headerUserInfo = document.getElementById('header-user-info');
    if (headerUserInfo) {
        headerUserInfo.classList.add('hidden');
    }
    
    // Show center login form again
    const loginSection = document.getElementById('login-section');
    const userDetailsSection = document.getElementById('user-details');
    const heroSection = document.getElementById('hero-section');
    const paymentHistorySection = document.getElementById('payment-history');
    
    if (loginSection) {
        loginSection.classList.remove('hidden');
        loginSection.style.display = 'block';
    }
    if (userDetailsSection) {
        userDetailsSection.classList.add('hidden');
        userDetailsSection.style.display = 'none';
    }
    
    // Hide hero section (shopping options)
    if (heroSection) heroSection.style.display = 'none';
    
    // Hide payment history section
    if (paymentHistorySection) paymentHistorySection.style.display = 'none';
    
    // Update top-right panel to show login form
    const panel = document.getElementById('top-right-login');
    if (panel) panel.remove();
    createTopRightLoginPanel();
    
    // Clear form fields
    const nameField = document.getElementById('name');
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    if (nameField) nameField.value = '';
    if (emailField) emailField.value = '';
    if (passwordField) passwordField.value = '';
    
    toast.show(`Goodbye, ${userName}! You have been logged out successfully! 👋`, 'info', 3000);
}

// Function to display header user info on all pages (simplified - no logout button)
function displayHeaderUserInfo() {
    const loginData = JSON.parse(localStorage.getItem('techstore_user_login') || '{}');
    const headerUserInfo = document.getElementById('header-user-info');
    const headerUserName = document.getElementById('header-user-name');

    if (loginData.isLoggedIn && headerUserInfo) {
        headerUserInfo.classList.remove('hidden');
        if (headerUserName) {
            headerUserName.textContent = loginData.name || 'User';
        }
        // Remove any logout button from header since we have top-right logout
        const headerLogout = document.getElementById('header-logout');
        if (headerLogout) {
            headerLogout.style.display = 'none';
        }
    } else if (headerUserInfo) {
        headerUserInfo.classList.add('hidden');
    }
}

// Function to highlight current page navigation
function highlightCurrentNavigation() {
    // Get current page name from URL, works with file:// protocol
    const currentPage = getCurrentPageName();
    const navLinks = document.querySelectorAll('.navbar nav ul li a');
    
    // Remove any existing active classes
    navLinks.forEach(link => {
        link.classList.remove('nav-active');
    });
    
    // Add active class to current page link
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        const linkText = link.textContent.trim().toLowerCase();
        
        // Check for exact match or home page variations
        if (href === currentPage || 
            (currentPage === 'index.html' && (href === '#' || linkText === 'home')) ||
            (currentPage === '' && (href === '#' || linkText === 'home')) ||
            (currentPage === 'product.html' && (href === 'product.html' || linkText === 'components')) ||
            (currentPage === 'cart.html' && (href === 'cart.html' || linkText === 'cart')) ||
            href === './' + currentPage) {
            link.classList.add('nav-active');
        }
    });
}

// Header user info will be handled by main DOMContentLoaded listener

// Payment History Management
class PaymentHistory {
    constructor() {
        this.initializeHistory();
    }

    initializeHistory() {
        const currentFile = getCurrentPageName();
        if (currentFile === 'index.html' || currentFile === '' || currentFile === 'START-HERE.html') {
            this.setupHistoryEventListeners();
            this.displayPaymentHistory();
        }
    }

    setupHistoryEventListeners() {
        const clearHistoryBtn = document.querySelector('#clear-history');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        }
    }

    displayPaymentHistory() {
        const loginData = JSON.parse(localStorage.getItem('techstore_user_login') || '{}');
        const historySection = document.querySelector('#payment-history');
        
        if (loginData.isLoggedIn && historySection) {
            const orderHistory = JSON.parse(localStorage.getItem('techstore_order_history') || '[]');
            
            if (orderHistory.length > 0) {
                historySection.classList.remove('hidden');
                historySection.style.display = 'block'; // Ensure it's visible
                this.renderOrderHistory(orderHistory);
            } else {
                // Keep history section hidden if no orders
                historySection.classList.add('hidden');
                historySection.style.display = 'none';
            }
        }
    }

    renderOrderHistory(orders) {
        const container = document.querySelector('#history-container');
        const orderCount = document.querySelector('#order-count');
        
        if (!container || !orderCount) {
            return;
        }

        orderCount.textContent = orders.length;

        if (orders.length === 0) {
            container.innerHTML = '<p class="no-orders">No orders found. Start shopping to see your order history! 🛒</p>';
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <div class="order-id">Order ${order.id}</div>
                        <div class="order-date">${order.date}</div>
                    </div>
                    <div class="order-status status-${order.status}">
                        ${order.status}
                    </div>
                </div>
                
                <div class="order-details">
                    <div class="detail-item">
                        <span class="detail-label">Total Amount:</span>
                        <span class="detail-value">${order.total}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Payment Method:</span>
                        <span class="detail-value">${order.paymentMethod}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Items Count:</span>
                        <span class="detail-value">${order.itemCount} items</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value">${order.status === 'completed' ? 'Delivered' : 'Processing'}</span>
                    </div>
                </div>
                
                <div class="order-items">
                    <h4>Items Purchased:</h4>
                    <div class="item-list">
                        ${order.items.map(item => `
                            <span class="item-tag">${item.name} (${item.quantity || 1}x)</span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear your order history? This action cannot be undone.')) {
            localStorage.removeItem('techstore_order_history');
            toast.show('Order history cleared successfully! 🗑️', 'info', 3000);
            
            const historySection = document.querySelector('#payment-history');
            if (historySection) {
                historySection.classList.add('hidden');
                historySection.style.display = 'none';
            }
            
            // Also refresh the display
            this.displayPaymentHistory();
        }
    }
}

// Payment history will be initialized by main DOMContentLoaded listener

// Category Filtering System
class CategoryFilter {
    constructor() {
        this.currentCategory = 'all';
        this.init();
    }

    init() {
        this.setupCategoryButtons();
        this.filterProducts('all');
    }

    setupCategoryButtons() {
        const categoryButtons = document.querySelectorAll('.category-btn');
        
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.getAttribute('data-category');
                this.filterProducts(category);
                this.updateActiveButton(e.target);
            });
        });
    }

    filterProducts(category) {
        const categorySections = document.querySelectorAll('.category-section');
        
        if (category === 'all') {
            // Show all sections
            categorySections.forEach(section => {
                section.style.display = 'block';
            });
        } else {
            // Hide all sections first
            categorySections.forEach(section => {
                section.style.display = 'none';
            });
            
            // Show only the selected category section
            categorySections.forEach(section => {
                const sectionCategory = section.getAttribute('data-category');
                if (sectionCategory === category) {
                    section.style.display = 'block';
                }
            });
        }
        
        this.currentCategory = category;
    }

    updateActiveButton(activeBtn) {
        // Remove active class from all buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        activeBtn.classList.add('active');
    }
}

// Safe Storage Helper (replaces undefined SafeStorage)
const SafeStorage = {
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
    removeItem: (key) => localStorage.removeItem(key)
};

// Category filtering functions
function setupCategoryFilters() {
    try {
        const categoryButtons = document.querySelectorAll('.category-btn, [data-category]');
        
        if (categoryButtons.length === 0) {
            return;
        }
        
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.target.getAttribute('data-category') || 'all';
                filterProductsByCategory(category);
                updateActiveCategoryButton(e.target);
            });
        });
    } catch (error) {
        // Silent error handling
    }
}

function filterProductsByCategory(category) {
    try {
        const productCards = document.querySelectorAll('.product-card');
        
        if (productCards.length === 0) {
            return;
        }
        
        productCards.forEach(card => {
            const productCategory = card.getAttribute('data-category');
            
            if (category === 'all' || productCategory === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    } catch (error) {
        // Silent error handling
    }
}

function updateActiveCategoryButton(activeBtn) {
    try {
        // Remove active class from all category buttons
        document.querySelectorAll('.category-btn, [data-category]').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        activeBtn.classList.add('active');
    } catch (error) {
        // Silent error handling
    }
}

function loadCartItems() {
    const cartContainer = document.getElementById('cart-products');
    const cartTotalEl = document.getElementById('cart-total');
    
    if (!cartContainer) return;
    
    const cartData = SafeStorage.getItem('techstore_cart');
    
    if (!cartData) {
        cartContainer.innerHTML = '<p style="text-align: center; color: #569cd6; font-size: 1.2rem;">Your cart is empty. <a href="products.html">Start shopping!</a></p>';
        if (cartTotalEl) cartTotalEl.textContent = 'Total: ₹0';
        return;
    }
    
    try {
        const cartItems = JSON.parse(cartData);
        
        if (cartItems.length === 0) {
            cartContainer.innerHTML = '<p style="text-align: center; color: #569cd6; font-size: 1.2rem;">Your cart is empty. <a href="products.html">Start shopping!</a></p>';
            if (cartTotalEl) cartTotalEl.textContent = 'Total: ₹0';
            return;
        }
        
        let total = 0;
        
        cartContainer.innerHTML = cartItems.map((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            // Use CategoryDetector utility for category and SVG determination
            const category = CategoryDetector.detectCategory(item.name, item.category);
            const fallbackImage = CategoryDetector.getCategoryImage(category);
            
            return `
                <div class="cart-item" data-index="${index}" data-category="${category}">
                    ${item.image && item.image !== 'undefined' && item.image !== '' ? 
                        `<img src="${item.image}" alt="${item.name}" onerror="this.src='${fallbackImage}'">` : 
                        `<img src="${fallbackImage}" alt="${item.name}">`
                    }
                    <h3>${item.name}</h3>
                    <p class="price">₹${item.price.toLocaleString()}</p>
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
                        <span class="quantity">Qty: ${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart(${index})">Remove Item</button>
                </div>
            `;
        }).join('');
        
        if (cartTotalEl) {
            cartTotalEl.textContent = `Total: ₹${total.toLocaleString()}`;
        }
        
    } catch (e) {
        cartContainer.innerHTML = '<p style="text-align: center; color: #ff6b6b;">Error loading cart items.</p>';
    }
}

// Enhanced Add to Cart with better price parsing
function addToCart(productCard) {
    const name = productCard.querySelector('h4').textContent;
    const priceText = productCard.querySelector('.product-price, .price').textContent;
    const price = parseFloat(priceText.replace(/[₹$,]/g, '')) || 0;
    const imgElement = productCard.querySelector('img');
    const imgSrc = imgElement ? imgElement.src : '';
    const description = productCard.querySelector('.product-description, .description');
    
    // Use CategoryDetector utility for category determination
    const category = CategoryDetector.detectCategory(name);
    
    const cartItem = {
        id: Date.now() + Math.random(),
        name: name,
        price: price,
        image: imgSrc && imgSrc !== window.location.href ? imgSrc : '',
        description: description ? description.textContent : '',
        category: category, // Store category for proper SVG display
        quantity: 1
    };
    
    // Get existing cart
    let cartItems = [];
    const existingCart = SafeStorage.getItem('techstore_cart');
    
    if (existingCart) {
        try {
            cartItems = JSON.parse(existingCart);
        } catch (e) {
            // Silent error handling - log only in development
        }
    }
    
    // Check if item already exists
    const existingIndex = cartItems.findIndex(item => item.name === name);
    
    if (existingIndex !== -1) {
        cartItems[existingIndex].quantity += 1;
        // Update category if not present
        if (!cartItems[existingIndex].category) {
            cartItems[existingIndex].category = category;
        }
    } else {
        cartItems.push(cartItem);
    }
    
    // Save cart
    SafeStorage.setItem('techstore_cart', JSON.stringify(cartItems));
    
    // Show success message
    const toast = new ToastNotification();
    toast.show(`${name} added to cart! 🛒`, 'success', 2000);
}

function updateQuantity(index, change) {
    const cartData = SafeStorage.getItem('techstore_cart');
    if (!cartData) return;
    
    try {
        const cartItems = JSON.parse(cartData);
        
        if (cartItems[index]) {
            cartItems[index].quantity += change;
            
            if (cartItems[index].quantity <= 0) {
                cartItems.splice(index, 1);
            }
            
            SafeStorage.setItem('techstore_cart', JSON.stringify(cartItems));
            loadCartItems();
        }
    } catch (e) {
        // Silent error handling - log only in development
    }
}

function removeFromCart(index) {
    const cartData = SafeStorage.getItem('techstore_cart');
    if (!cartData) return;
    
    try {
        const cartItems = JSON.parse(cartData);
        
        if (cartItems[index]) {
            const itemName = cartItems[index].name;
            cartItems.splice(index, 1);
            
            SafeStorage.setItem('techstore_cart', JSON.stringify(cartItems));
            loadCartItems();
            
            const toast = new ToastNotification();
            toast.show(`${itemName} removed from cart! 🗑️`, 'info', 2000);
        }
    } catch (e) {
        // Silent error handling - log only in development
    }
}

function showPaymentSection() {
    const cartData = SafeStorage.getItem('techstore_cart');
    
    if (!cartData) {
        const toast = new ToastNotification();
        toast.show('Your cart is empty!', 'warning', 3000);
        return;
    }
    
    try {
        const cartItems = JSON.parse(cartData);
        
        if (cartItems.length === 0) {
            const toast = new ToastNotification();
            toast.show('Your cart is empty!', 'warning', 3000);
            return;
        }
        
        const paymentSection = document.getElementById('payment-section');
        if (paymentSection) {
            paymentSection.style.display = 'block';
            paymentSection.scrollIntoView({ behavior: 'smooth' });
        }
        
    } catch (e) {
        // Silent error handling - log only in development
    }
}

function setupPaymentForm() {
    const completePaymentBtn = document.getElementById('complete-payment');
    
    if (completePaymentBtn) {
        completePaymentBtn.addEventListener('click', function() {
            processPayment();
        });
    }
}

// Proceed to Checkout: send cart data to backend
async function proceedToCheckout() {
    const cart = JSON.parse(localStorage.getItem('techstore_cart') || '[]');
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    const orderData = {
        orderItems: cart.map(item => ({
            productId: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image || ''
        })),
        shippingAddress: "Default Address", // Replace with actual user input if available
        paymentMethod: "COD", // Or get from user selection
        totalPrice: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    };
    try {
        await orderAPI.createOrder(orderData);
        alert('Order placed successfully!');
        localStorage.removeItem('techstore_cart');
        // Optionally redirect or update UI
    } catch (error) {
        alert('Error placing order. Please try again.');
    }
}

// Attach to checkout button if it exists
const checkoutBtn = document.getElementById('checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', proceedToCheckout);
}

// Product page functionality
function initializeProductsPage() {
    const currentPage = getCurrentPageName();
    if (currentPage.includes('products.html') || currentPage.includes('product')) {
        // Check if products grid exists to determine if we're on products page
        const productsGrid = document.getElementById('products-grid');
        if (productsGrid) {
            loadProducts();
        } else {
            // Setup category filters for static product pages
            setTimeout(() => {
                setupCategoryFilters();
            }, 300);
        }
    }
}

async function loadProducts() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    try {
        // Show loading
        productsGrid.innerHTML = `
            <div class="loading-message">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="animate-spin">
                    <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/>
                </svg>
                Loading products...
            </div>
        `;

        // Use the productAPI from api.js
        const products = await productAPI.getProducts();

        if (products && products.length > 0) {
            displayProducts(products);
        } else {
            productsGrid.innerHTML = '<p class="no-products">No products available at the moment.</p>';
        }
    } catch (error) {
        // Silent error handling - log only in development
        productsGrid.innerHTML = '<p class="error-message">Error loading products. Please try again later.</p>';
    }
}

function displayProducts(products) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;

    productsGrid.innerHTML = products.map(product => `
        <div class="product-card" data-category="${product.category}">
            <div class="product-image">
                ${product.image && product.image.trim() !== '' ? 
                    `<img src="${product.image}" alt="${product.name}" width="200" height="150" onerror="handleImageError(this)">` : 
                    `<img src="./images/generic.svg" alt="${product.name}" width="200" height="150" onerror="handleImageError(this)">`
                }
            </div>
            <div class="product-info">
                <h4>${product.name}</h4>
                <p class="product-description">${product.description}</p>
                <p class="product-price">₹${product.price}</p>
                <button class="btn add-to-cart-btn" data-name="${product.name}" data-price="${product.price}" data-id="${product.id}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.42 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');

    // Attach event listeners to Add to Cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.dataset.id;
            const name = this.dataset.name;
            const price = this.dataset.price;
            let cart = JSON.parse(localStorage.getItem('techstore_cart') || '[]');
            const existing = cart.find(item => item.id === id);
            if (existing) {
                existing.quantity += 1;
            } else {
                cart.push({ id, name, price, quantity: 1 });
            }
            localStorage.setItem('techstore_cart', JSON.stringify(cart));
            toast.show(`${name} added to cart! 🛒`, 'success', 2000);
        });
    });
    
    // Setup category filters after products are loaded
    setTimeout(() => {
        setupCategoryFilters();
    }, 100);
}

// Render cart items on checkout page
function renderCartOnCheckout() {
    const cartContainer = document.getElementById('cart-items');
    if (!cartContainer) return;
    const cart = JSON.parse(localStorage.getItem('techstore_cart') || '[]');
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }
    cartContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <span>${item.name}</span> x <span>${item.quantity}</span> - ₹${item.price}
        </div>
    `).join('');
}
