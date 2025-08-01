const userData = JSON.parse(localStorage.getItem('techstore_user'));
const username = userData?.username || 'guest';
const CART_KEY = `techstore_cart_${username}`;
const ORDER_HISTORY_KEY = `techstore_order_history_${username}`;
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
    window.techStoreCart.setupCartButtonHandlers();
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

    const userData = JSON.parse(localStorage.getItem('techstore_user') || '{}');
    if (!userData.isLoggedIn) return;

    const logoutPanel = document.createElement('div');
    logoutPanel.id = 'top-right-logout';
    logoutPanel.className = 'button-group-panel';

    logoutPanel.innerHTML = `
        <button class="btn-done"><span style="margin-right:6px;">👤</span>${userData.name}</button>
        <button class="btn-logout" onclick="handleTopRightLogout()">Logout</button>
    `;

    document.body.appendChild(logoutPanel);
}

// Enhanced top-right logout handler
function handleTopRightLogout() {
    const userData = JSON.parse(localStorage.getItem('techstore_user') || '{}');
    const userName = userData.name || 'User';
    
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
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Validate form
            if (!email || !password) {
                toast.show('Please fill in all fields', 'error', 3000);
                return;
            }

            try {
                // ✅ Call backend to login and receive token
                const result = await authAPI.login(email, password); // { token, username, email }

                // Save user data and token to localStorage
                const userData = {
                    token: result.token,
                    name: result.username || 'User',
                    email: result.email,
                    loginTime: new Date().toLocaleString(),
                    isLoggedIn: true
                };

                localStorage.setItem('techstore_user', JSON.stringify(userData));

                // Show success message
                toast.show(`Welcome, ${userData.name}! Login successful.`, 'success', 3000);

                // Update header
                const headerUserName = document.getElementById('header-user-name');
                if (headerUserName) {
                    headerUserName.textContent = userData.name;
                }

                // Hide login section
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

                // Show logout panel
                createTopRightLogoutPanel();
            } catch (error) {
                toast.show(`Login failed: ${error.message}`, 'error', 3000);
            }
        });
    }
}


// TechStore E-commerce Platform
// Custom shopping cart implementation

class TechStoreCart {
    constructor() {
        this.cartItems = this.getCart();
    }

    getCart() {
        return JSON.parse(localStorage.getItem('cart') || '[]');
    }

    saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
        this.cartItems = cart;
    }

    renderCartItems() {
        const productGrid = document.querySelector('#cart-products');
        if (!productGrid) return;

        if (this.cartItems.length === 0) {
            productGrid.innerHTML = '<p style="text-align: center; color: #569cd6; font-size: 1.2rem;">Your cart is empty!</p>';
            return;
        }

        productGrid.innerHTML = this.cartItems.map(item => {
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

        this.attachRemoveListeners();
        this.attachQuantityListeners();
    }

    attachRemoveListeners() {
        const removeBtns = document.querySelectorAll('.remove-btn');
        removeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productCard = e.target.closest('.product-card');
                const itemId = productCard?.dataset.itemId;
                if (itemId) this.removeFromCart(itemId);
            });
        });
    }

    attachQuantityListeners() {
        const buttons = document.querySelectorAll('.quantity-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productCard = e.target.closest('.product-card');
                const itemId = productCard?.dataset.itemId;
                const action = e.target.dataset.action;

                if (itemId && action === 'increase') {
                    this.increaseQuantity(itemId);
                } else if (itemId && action === 'decrease') {
                    this.decreaseQuantity(itemId);
                }
            });
        });
    }

    increaseQuantity(productId) {
        const cart = this.getCart();
        const index = cart.findIndex(item => item.id == productId);
        if (index !== -1) {
            cart[index].quantity = (cart[index].quantity || 1) + 1;
            this.saveCart(cart);
            this.renderCartItems();
        }
    }

    decreaseQuantity(productId) {
        const cart = this.getCart();
        const index = cart.findIndex(item => item.id == productId);
        if (index !== -1) {
            const qty = cart[index].quantity || 1;
            if (qty > 1) {
                cart[index].quantity -= 1;
            } else {
                cart.splice(index, 1);
            }
            this.saveCart(cart);
            this.renderCartItems();
        }
    }

    removeFromCart(productId) {
        const updatedCart = this.cartItems.filter(item => item.id != productId);
        this.saveCart(updatedCart);
        this.renderCartItems();
    }

    // ✅ NEW METHOD ADDED HERE
    setupCartButtonHandlers() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart');

        addToCartButtons.forEach(button => {
            button.addEventListener('click', () => {
                const itemData = {
                    id: button.dataset.id,
                    name: button.dataset.name,
                    price: button.dataset.price,
                    imgSrc: button.dataset.img,
                    quantity: 1,
                    category: button.dataset.category
                };

                const existing = this.cartItems.find(item => item.id == itemData.id);
                if (existing) {
                    existing.quantity += 1;
                } else {
                    this.cartItems.push(itemData);
                }

                this.saveCart(this.cartItems);
                alert('Item added to cart');
            });
        });
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
function displayUserDetails(userData, showHistory = false) {
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
function updateTopRightPanel(userData) {
    // Remove any existing panel
    const existingPanel = document.getElementById('top-right-logout');
    if (existingPanel) existingPanel.remove();
    
    // Create new logout panel
    createTopRightLogoutPanel();
}

// Function to check login status on page load
function checkLoginStatus() {
    const userData = JSON.parse(localStorage.getItem('techstore_user') || '{}');
    
    if (userData.isLoggedIn) {
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
    const userData = JSON.parse(localStorage.getItem('techstore_user') || '{}');
    const userName = userData.name || 'User';

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
    const userData = JSON.parse(localStorage.getItem('techstore_user') || '{}');
    const headerUserInfo = document.getElementById('header-user-info');
    const headerUserName = document.getElementById('header-user-name');

    if (userData.isLoggedIn && headerUserInfo) {
        headerUserInfo.classList.remove('hidden');
        if (headerUserName) {
            headerUserName.textContent = userData.name || 'User';
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
        const userData = JSON.parse(localStorage.getItem('techstore_user') || '{}');
        const historySection = document.querySelector('#payment-history');

        if (userData.isLoggedIn && historySection) {
            const orderHistory = JSON.parse(localStorage.getItem(ORDER_HISTORY_KEY) || '[]');

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
    
    const cartData = localStorage.getItem(CART_KEY);
    
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
    const existingCart = localStorage.getItem(CART_KEY);
    
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
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
       
    // Show success message
    const toast = new ToastNotification();
    toast.show(`${name} added to cart! 🛒`, 'success', 2000);
}

function updateQuantity(index, change) {
    const cartData = localStorage.getItem(CART_KEY);
    if (!cartData) return;
    
    try {
        const cartItems = JSON.parse(cartData);
        
        if (cartItems[index]) {
            cartItems[index].quantity += change;
            
            if (cartItems[index].quantity <= 0) {
                cartItems.splice(index, 1);
            }
            
            localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
            loadCartItems();
        }
    } catch (e) {
        // Silent error handling - log only in development
    }
}

function removeFromCart(index) {
    const cartData = localStorage.getItem(CART_KEY);
    if (!cartData) return;
    
    try {
        const cartItems = JSON.parse(cartData);
        
        if (cartItems[index]) {
            const itemName = cartItems[index].name;
            cartItems.splice(index, 1);
            
            localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
            loadCartItems();
            
            const toast = new ToastNotification();
            toast.show(`${itemName} removed from cart! 🗑️`, 'info', 2000);
        }
    } catch (e) {
        // Silent error handling - log only in development
    }
}

function showPaymentSection() {
    const cartData = localStorage.getItem(CART_KEY);
    
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
function showMessage(message, type = 'success') {
    const messageBox = document.getElementById('messageBox');
    messageBox.textContent = message;
    messageBox.style.display = 'block';
    messageBox.style.backgroundColor = type === 'error' ? '#f8d7da' : '#d4edda';
    messageBox.style.color = type === 'error' ? '#721c24' : '#155724';
    messageBox.style.border = type === 'error' ? '1px solid #f5c6cb' : '1px solid #c3e6cb';

    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 3000);
}


// Proceed to Checkout: send cart data to backend
async function proceedToCheckout() {
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
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
    } 
    catch (error) {
    if (
        error.message.includes('Failed to fetch') || 
        error.message.includes('NetworkError') || 
        error.message.includes('500') || 
        !navigator.onLine
    ) {
        showMessage('Unable to connect to server. Please try again later.', 'error');
    } else {
        console.error('Checkout error:', error);
    }
}}

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
        <div class="product-card" data-category="${product.category}" data-product-id="${product.id}">
            <div class="product-image">
                ${product.image_url && product.image_url.trim() !== '' ? 
                    `<img src="${product.image_url}" alt="${product.name}" width="200" height="150" onerror="handleImageError(this)">` : 
                    `<img src="./images/generic.svg" alt="${product.name}" width="200" height="150" onerror="handleImageError(this)">`
                }
            </div>
            <div class="product-info">
                <h4>${product.name}</h4>
                <p class="product-description">${product.description}</p>
                <p class="product-price">₹${product.price}</p>
                <button class="btn add-to-cart-btn" data-name="${product.name}" data-price="${product.price}" data-id="${product.id}" data-product-id="${product.id}">
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
            let cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
            const existing = cart.find(item => item.id === id);
            if (existing) {
                existing.quantity += 1;
            } else {
                cart.push({ id, name, price, quantity: 1 });
            }
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
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
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
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
