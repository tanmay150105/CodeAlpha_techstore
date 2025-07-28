// user-tracking.js - Track user activities and send to backend
class UserTracker {
    constructor() {
        this.apiBaseUrl = 'http://localhost:5000/api/tracking';
        this.visitorId = this.getOrCreateVisitorId();
        this.currentUser = this.getCurrentUser();
        this.init();
    }

    init() {
        this.trackPageVisit();
        this.setupProductViewTracking();
        this.setupCartTracking();
        this.setupCheckoutTracking();
    }

    // Get or create visitor ID for anonymous users
    getOrCreateVisitorId() {
        let visitorId = localStorage.getItem('techstore_visitor_id');
        if (!visitorId) {
            visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('techstore_visitor_id', visitorId);
        }
        return visitorId;
    }

    // Get current logged-in user info
    getCurrentUser() {
        const userStr = localStorage.getItem('techstore_user');
        return userStr ? JSON.parse(userStr) : null;
    }

    // Send tracking data to backend
    async sendTrackingData(endpoint, data) {
        try {
            const trackingData = {
                user_id: this.currentUser?.id || null,
                visitor_id: this.visitorId,
                ...data
            };

            await fetch(`${this.apiBaseUrl}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(trackingData)
            });
        } catch (error) {
            console.log('Tracking error:', error);
        }
    }

    // Track page visits
    trackPageVisit() {
        this.sendTrackingData('page-visit', {
            page_url: window.location.href,
            page_title: document.title,
            referrer: document.referrer
        });
    }

    // Track user login
    trackLogin(userId, sessionToken) {
        this.currentUser = { id: userId };
        this.sendTrackingData('login', {
            user_id: userId,
            session_token: sessionToken
        });
    }

    // Track user logout
    trackLogout(userId, sessionToken) {
        this.sendTrackingData('logout', {
            user_id: userId,
            session_token: sessionToken
        });
        this.currentUser = null;
    }

    // Setup product view tracking
    setupProductViewTracking() {
        // Track when user views a product (on products page)
        if (window.location.pathname.includes('products')) {
            // Monitor clicks on product cards
            document.addEventListener('click', (e) => {
                const productCard = e.target.closest('.product-card');
                if (productCard) {
                    const productId = productCard.dataset.productId;
                    if (productId) {
                        this.trackProductView(productId);
                    }
                }
            });
        }
    }

    // Track product view
    trackProductView(productId, viewDuration = 0) {
        this.sendTrackingData('product-view', {
            product_id: parseInt(productId),
            view_duration: viewDuration
        });
    }

    // Setup cart tracking
    setupCartTracking() {
        // Monitor add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart') || 
                e.target.closest('.add-to-cart')) {
                
                const productId = e.target.dataset.productId || 
                                e.target.closest('[data-product-id]')?.dataset.productId;
                if (productId) {
                    this.trackAddToCart(productId, 1);
                }
            }

            // Monitor remove from cart buttons
            if (e.target.classList.contains('remove-from-cart') || 
                e.target.closest('.remove-from-cart')) {
                
                const productId = e.target.dataset.productId || 
                                e.target.closest('[data-product-id]')?.dataset.productId;
                if (productId) {
                    this.trackRemoveFromCart(productId);
                }
            }
        });
    }

    // Track add to cart
    trackAddToCart(productId, quantity = 1) {
        this.sendTrackingData('add-to-cart', {
            product_id: parseInt(productId),
            quantity: quantity
        });
    }

    // Track remove from cart
    trackRemoveFromCart(productId) {
        this.sendTrackingData('remove-from-cart', {
            product_id: parseInt(productId)
        });
    }

    // Setup checkout tracking
    setupCheckoutTracking() {
        // Track checkout start when user goes to cart page
        if (window.location.pathname.includes('cart')) {
            const cart = JSON.parse(localStorage.getItem('techstore_cart') || '[]');
            if (cart.length > 0) {
                this.trackCheckoutStart(cart);
            }
        }

        // Monitor checkout button clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('checkout-btn') || 
                e.target.closest('.checkout-btn')) {
                
                const cart = JSON.parse(localStorage.getItem('techstore_cart') || '[]');
                this.trackCheckoutStart(cart);
            }

            // Monitor place order button
            if (e.target.classList.contains('place-order-btn') || 
                e.target.closest('.place-order-btn')) {
                
                this.trackCheckoutAttempt();
            }
        });
    }

    // Track checkout start
    trackCheckoutStart(cartItems) {
        this.sendTrackingData('checkout-start', {
            cart_items: cartItems
        });
    }

    // Track successful order completion
    trackOrderComplete(orderId, totalAmount, paymentMethod) {
        this.sendTrackingData('checkout-complete', {
            order_id: orderId,
            total_amount: totalAmount,
            payment_method: paymentMethod
        });
    }

    // Track checkout attempt (when place order is clicked)
    trackCheckoutAttempt() {
        const cart = JSON.parse(localStorage.getItem('techstore_cart') || '[]');
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        this.sendTrackingData('checkout-start', {
            cart_items: cart,
            total_amount: total
        });
    }

    // Update current user (call this when user logs in)
    updateCurrentUser(user) {
        this.currentUser = user;
    }
}

// Initialize tracking when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.userTracker = new UserTracker();
});

// Make it available globally
window.UserTracker = UserTracker;
