/**
 * Centralized Input Validation Utilities
 * Provides comprehensive validation functions for user inputs, products, and orders
 */

class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * User validation utilities
 */
const userValidation = {
  /**
   * Validate user registration data
   * @param {Object} userData - User data to validate
   * @returns {Object} - Validation result
   */
  validateRegistration({ name, email, password }) {
    const errors = [];

    // Name validation
    if (!name || typeof name !== 'string') {
      errors.push({ field: 'name', message: 'Name is required' });
    } else if (name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
    } else if (name.trim().length > 50) {
      errors.push({ field: 'name', message: 'Name must be less than 50 characters' });
    } else if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
      errors.push({ field: 'name', message: 'Name can only contain letters and spaces' });
    }

    // Email validation
    if (!email || typeof email !== 'string') {
      errors.push({ field: 'email', message: 'Email is required' });
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.push({ field: 'email', message: 'Please provide a valid email address' });
      } else if (email.trim().length > 100) {
        errors.push({ field: 'email', message: 'Email must be less than 100 characters' });
      }
    }

    // Password validation
    if (!password || typeof password !== 'string') {
      errors.push({ field: 'password', message: 'Password is required' });
    } else if (password.length < 6) {
      errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
    } else if (password.length > 128) {
      errors.push({ field: 'password', message: 'Password must be less than 128 characters' });
    } else if (!/(?=.*[a-zA-Z])/.test(password)) {
      errors.push({ field: 'password', message: 'Password must contain at least one letter' });
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password
      } : null
    };
  },

  /**
   * Validate user login data
   * @param {Object} loginData - Login data to validate
   * @returns {Object} - Validation result
   */
  validateLogin({ email, password }) {
    const errors = [];

    // Email validation
    if (!email || typeof email !== 'string') {
      errors.push({ field: 'email', message: 'Email is required' });
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.push({ field: 'email', message: 'Please provide a valid email address' });
      }
    }

    // Password validation
    if (!password || typeof password !== 'string') {
      errors.push({ field: 'password', message: 'Password is required' });
    } else if (password.length < 1) {
      errors.push({ field: 'password', message: 'Password cannot be empty' });
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? {
        email: email.toLowerCase().trim(),
        password
      } : null
    };
  }
};

/**
 * Product validation utilities
 */
const productValidation = {
  /**
   * Validate product data
   * @param {Object} productData - Product data to validate
   * @returns {Object} - Validation result
   */
  validateProduct({ name, description, price, category, stock, image }) {
    const errors = [];
    const validCategories = ['processors', 'graphics', 'memory', 'cooling', 'peripherals'];

    // Name validation
    if (!name || typeof name !== 'string') {
      errors.push({ field: 'name', message: 'Product name is required' });
    } else if (name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Product name must be at least 2 characters long' });
    } else if (name.trim().length > 200) {
      errors.push({ field: 'name', message: 'Product name must be less than 200 characters' });
    }

    // Description validation
    if (description && typeof description === 'string' && description.trim().length > 1000) {
      errors.push({ field: 'description', message: 'Description must be less than 1000 characters' });
    }

    // Price validation
    if (price === undefined || price === null) {
      errors.push({ field: 'price', message: 'Price is required' });
    } else {
      const numPrice = parseFloat(price);
      if (isNaN(numPrice) || numPrice < 0) {
        errors.push({ field: 'price', message: 'Price must be a valid positive number' });
      } else if (numPrice > 10000000) {
        errors.push({ field: 'price', message: 'Price cannot exceed ₹10,000,000' });
      }
    }

    // Category validation
    if (category && !validCategories.includes(category)) {
      errors.push({ field: 'category', message: `Category must be one of: ${validCategories.join(', ')}` });
    }

    // Stock validation
    if (stock !== undefined && stock !== null) {
      const numStock = parseInt(stock);
      if (isNaN(numStock) || numStock < 0) {
        errors.push({ field: 'stock', message: 'Stock must be a valid non-negative number' });
      } else if (numStock > 1000000) {
        errors.push({ field: 'stock', message: 'Stock cannot exceed 1,000,000 units' });
      }
    }

    // Image URL validation (optional)
    if (image && typeof image === 'string') {
      try {
        new URL(image);
      } catch {
        errors.push({ field: 'image', message: 'Image must be a valid URL' });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? {
        name: name.trim(),
        description: description ? description.trim() : '',
        price: parseFloat(price),
        category: category || 'generic',
        stock: stock !== undefined ? parseInt(stock) : 0,
        image: image || ''
      } : null
    };
  }
};

/**
 * Order validation utilities
 */
const orderValidation = {
  /**
   * Validate order data
   * @param {Object} orderData - Order data to validate
   * @returns {Object} - Validation result
   */
  validateOrder({ userId, items, shippingAddress, paymentMethod }) {
    const errors = [];

    // User ID validation
    if (!userId || typeof userId !== 'number') {
      errors.push({ field: 'userId', message: 'Valid user ID is required' });
    }

    // Items validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      errors.push({ field: 'items', message: 'Order must contain at least one item' });
    } else {
      items.forEach((item, index) => {
        if (!item.productId || typeof item.productId !== 'number') {
          errors.push({ field: `items[${index}].productId`, message: 'Valid product ID is required' });
        }
        if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1) {
          errors.push({ field: `items[${index}].quantity`, message: 'Quantity must be at least 1' });
        }
        if (item.quantity > 100) {
          errors.push({ field: `items[${index}].quantity`, message: 'Quantity cannot exceed 100 per item' });
        }
      });
    }

    // Shipping address validation
    if (!shippingAddress || typeof shippingAddress !== 'string') {
      errors.push({ field: 'shippingAddress', message: 'Shipping address is required' });
    } else if (shippingAddress.trim().length < 10) {
      errors.push({ field: 'shippingAddress', message: 'Shipping address must be at least 10 characters long' });
    } else if (shippingAddress.trim().length > 500) {
      errors.push({ field: 'shippingAddress', message: 'Shipping address must be less than 500 characters' });
    }

    // Payment method validation
    const validPaymentMethods = ['credit_card', 'debit_card', 'upi', 'net_banking', 'cash_on_delivery'];
    if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
      errors.push({ field: 'paymentMethod', message: `Payment method must be one of: ${validPaymentMethods.join(', ')}` });
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? {
        userId,
        items,
        shippingAddress: shippingAddress.trim(),
        paymentMethod
      } : null
    };
  }
};

/**
 * General validation utilities
 */
const generalValidation = {
  /**
   * Sanitize HTML to prevent XSS
   * @param {string} input - Input string to sanitize
   * @returns {string} - Sanitized string
   */
  sanitizeHtml(input) {
    if (typeof input !== 'string') return '';
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  /**
   * Validate ID parameter
   * @param {any} id - ID to validate
   * @returns {Object} - Validation result
   */
  validateId(id) {
    const numId = parseInt(id);
    if (isNaN(numId) || numId < 1) {
      return {
        isValid: false,
        error: 'Invalid ID format'
      };
    }
    return {
      isValid: true,
      value: numId
    };
  },

  /**
   * Validate pagination parameters
   * @param {any} page - Page number
   * @param {any} limit - Items per page
   * @returns {Object} - Validation result
   */
  validatePagination(page = 1, limit = 10) {
    const errors = [];
    
    const numPage = parseInt(page);
    const numLimit = parseInt(limit);
    
    if (isNaN(numPage) || numPage < 1) {
      errors.push({ field: 'page', message: 'Page must be a positive number' });
    }
    
    if (isNaN(numLimit) || numLimit < 1 || numLimit > 100) {
      errors.push({ field: 'limit', message: 'Limit must be between 1 and 100' });
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized: errors.length === 0 ? {
        page: numPage,
        limit: numLimit,
        offset: (numPage - 1) * numLimit
      } : null
    };
  }
};

module.exports = {
  ValidationError,
  userValidation,
  productValidation,
  orderValidation,
  generalValidation
};
