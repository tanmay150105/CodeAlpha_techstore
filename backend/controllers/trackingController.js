const { sequelize } = require('../config/database');

// Track user login
const trackLogin = async (req, res) => {
  try {
    const { user_id, session_token } = req.body;
    
    // Insert login session
    await sequelize.query(`
      INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent)
      VALUES (?, ?, ?, ?)
    `, {
      replacements: [user_id, session_token, req.ip, req.get('User-Agent')]
    });

    // Track login activity
    await sequelize.query(`
      INSERT INTO user_activities (user_id, activity_type, page_url, ip_address)
      VALUES (?, 'login', ?, ?)
    `, {
      replacements: [user_id, req.headers.referer || '/', req.ip]
    });

    res.status(201).json({ message: 'Login tracked successfully' });
  } catch (error) {
    console.error('Error tracking login:', error);
    res.status(500).json({ message: 'Error tracking login' });
  }
};

// Track user logout
const trackLogout = async (req, res) => {
  try {
    const { user_id, session_token } = req.body;
    
    // Update session logout time
    await sequelize.query(`
      UPDATE user_sessions 
      SET logout_time = CURRENT_TIMESTAMP, is_active = FALSE 
      WHERE user_id = ? AND session_token = ?
    `, {
      replacements: [user_id, session_token]
    });

    // Track logout activity
    await sequelize.query(`
      INSERT INTO user_activities (user_id, activity_type, page_url, ip_address)
      VALUES (?, 'logout', ?, ?)
    `, {
      replacements: [user_id, req.headers.referer || '/', req.ip]
    });

    res.status(200).json({ message: 'Logout tracked successfully' });
  } catch (error) {
    console.error('Error tracking logout:', error);
    res.status(500).json({ message: 'Error tracking logout' });
  }
};

// Track product view
const trackProductView = async (req, res) => {
  try {
    const { product_id, user_id, visitor_id, view_duration = 0 } = req.body;
    
    // Insert product view
    await sequelize.query(`
      INSERT INTO product_views (product_id, user_id, visitor_id, view_duration, ip_address)
      VALUES (?, ?, ?, ?, ?)
    `, {
      replacements: [product_id, user_id || null, visitor_id || null, view_duration, req.ip]
    });

    // Track product view activity
    await sequelize.query(`
      INSERT INTO user_activities (user_id, visitor_id, activity_type, activity_data, page_url, ip_address)
      VALUES (?, ?, 'product_view', ?, ?, ?)
    `, {
      replacements: [
        user_id || null, 
        visitor_id || null, 
        JSON.stringify({ product_id, view_duration }), 
        req.headers.referer || '/', 
        req.ip
      ]
    });

    res.status(201).json({ message: 'Product view tracked successfully' });
  } catch (error) {
    console.error('Error tracking product view:', error);
    res.status(500).json({ message: 'Error tracking product view' });
  }
};

// Track add to cart
const trackAddToCart = async (req, res) => {
  try {
    const { product_id, user_id, visitor_id, quantity = 1 } = req.body;
    
    // Insert or update cart item
    if (user_id) {
      await sequelize.query(`
        INSERT INTO shopping_carts (user_id, product_id, quantity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity), updated_at = CURRENT_TIMESTAMP
      `, {
        replacements: [user_id, product_id, quantity]
      });
    } else if (visitor_id) {
      await sequelize.query(`
        INSERT INTO shopping_carts (visitor_id, product_id, quantity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity), updated_at = CURRENT_TIMESTAMP
      `, {
        replacements: [visitor_id, product_id, quantity]
      });
    }

    // Track add to cart activity
    await sequelize.query(`
      INSERT INTO user_activities (user_id, visitor_id, activity_type, activity_data, page_url, ip_address)
      VALUES (?, ?, 'add_to_cart', ?, ?, ?)
    `, {
      replacements: [
        user_id || null, 
        visitor_id || null, 
        JSON.stringify({ product_id, quantity }), 
        req.headers.referer || '/', 
        req.ip
      ]
    });

    res.status(201).json({ message: 'Add to cart tracked successfully' });
  } catch (error) {
    console.error('Error tracking add to cart:', error);
    res.status(500).json({ message: 'Error tracking add to cart' });
  }
};

// Track remove from cart
const trackRemoveFromCart = async (req, res) => {
  try {
    const { product_id, user_id, visitor_id } = req.body;
    
    // Remove from cart
    if (user_id) {
      await sequelize.query(`
        DELETE FROM shopping_carts WHERE user_id = ? AND product_id = ?
      `, {
        replacements: [user_id, product_id]
      });
    } else if (visitor_id) {
      await sequelize.query(`
        DELETE FROM shopping_carts WHERE visitor_id = ? AND product_id = ?
      `, {
        replacements: [visitor_id, product_id]
      });
    }

    // Track remove from cart activity
    await sequelize.query(`
      INSERT INTO user_activities (user_id, visitor_id, activity_type, activity_data, page_url, ip_address)
      VALUES (?, ?, 'remove_from_cart', ?, ?, ?)
    `, {
      replacements: [
        user_id || null, 
        visitor_id || null, 
        JSON.stringify({ product_id }), 
        req.headers.referer || '/', 
        req.ip
      ]
    });

    res.status(200).json({ message: 'Remove from cart tracked successfully' });
  } catch (error) {
    console.error('Error tracking remove from cart:', error);
    res.status(500).json({ message: 'Error tracking remove from cart' });
  }
};

// Track checkout start
const trackCheckoutStart = async (req, res) => {
  try {
    const { user_id, visitor_id, cart_items } = req.body;
    
    // Track checkout start activity
    await sequelize.query(`
      INSERT INTO user_activities (user_id, visitor_id, activity_type, activity_data, page_url, ip_address)
      VALUES (?, ?, 'checkout_start', ?, ?, ?)
    `, {
      replacements: [
        user_id || null, 
        visitor_id || null, 
        JSON.stringify({ cart_items, total_items: cart_items?.length || 0 }), 
        req.headers.referer || '/', 
        req.ip
      ]
    });

    res.status(201).json({ message: 'Checkout start tracked successfully' });
  } catch (error) {
    console.error('Error tracking checkout start:', error);
    res.status(500).json({ message: 'Error tracking checkout start' });
  }
};

// Track checkout complete (order placed)
const trackCheckoutComplete = async (req, res) => {
  try {
    const { user_id, visitor_id, order_id, total_amount, payment_method } = req.body;
    
    // Track checkout complete activity
    await sequelize.query(`
      INSERT INTO user_activities (user_id, visitor_id, activity_type, activity_data, page_url, ip_address)
      VALUES (?, ?, 'checkout_complete', ?, ?, ?)
    `, {
      replacements: [
        user_id || null, 
        visitor_id || null, 
        JSON.stringify({ order_id, total_amount, payment_method }), 
        req.headers.referer || '/', 
        req.ip
      ]
    });

    // Clear cart after successful checkout
    if (user_id) {
      await sequelize.query(`DELETE FROM shopping_carts WHERE user_id = ?`, {
        replacements: [user_id]
      });
    } else if (visitor_id) {
      await sequelize.query(`DELETE FROM shopping_carts WHERE visitor_id = ?`, {
        replacements: [visitor_id]
      });
    }

    res.status(201).json({ message: 'Checkout complete tracked successfully' });
  } catch (error) {
    console.error('Error tracking checkout complete:', error);
    res.status(500).json({ message: 'Error tracking checkout complete' });
  }
};

// Track page visit
const trackPageVisit = async (req, res) => {
  try {
    const { user_id, visitor_id, page_url, page_title, referrer } = req.body;
    
    // Insert site visit
    await sequelize.query(`
      INSERT INTO site_visits (user_id, visitor_id, page_url, page_title, referrer, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, {
      replacements: [
        user_id || null, 
        visitor_id || null, 
        page_url, 
        page_title || '', 
        referrer || '', 
        req.ip, 
        req.get('User-Agent')
      ]
    });

    res.status(201).json({ message: 'Page visit tracked successfully' });
  } catch (error) {
    console.error('Error tracking page visit:', error);
    res.status(500).json({ message: 'Error tracking page visit' });
  }
};

module.exports = {
  trackLogin,
  trackLogout,
  trackProductView,
  trackAddToCart,
  trackRemoveFromCart,
  trackCheckoutStart,
  trackCheckoutComplete,
  trackPageVisit
};
