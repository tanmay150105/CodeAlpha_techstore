-- TechStore Database Schema
-- Run this script to create your MySQL database

-- Create database
CREATE DATABASE IF NOT EXISTS techstore 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE techstore;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    image_url VARCHAR(255),
    stock_quantity INT DEFAULT 0,
    brand VARCHAR(100),
    specifications JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT,
    payment_method VARCHAR(50),
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User sessions table (tracks login sessions)
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Site visits table (tracks all page visits)
CREATE TABLE IF NOT EXISTS site_visits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL, -- NULL for anonymous visitors
    visitor_id VARCHAR(255), -- For anonymous tracking
    page_url VARCHAR(500) NOT NULL,
    page_title VARCHAR(255),
    referrer VARCHAR(500),
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(255),
    visit_duration INT DEFAULT 0, -- in seconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- User activities table (tracks user actions)
CREATE TABLE IF NOT EXISTS user_activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    visitor_id VARCHAR(255), -- For anonymous tracking
    activity_type ENUM('page_view', 'product_view', 'add_to_cart', 'remove_from_cart', 'search', 'login', 'logout', 'register', 'purchase', 'checkout_start', 'checkout_complete') NOT NULL,
    activity_data JSON, -- Additional data about the activity
    page_url VARCHAR(500),
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Product views table (tracks product popularity)
CREATE TABLE IF NOT EXISTS product_views (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    user_id INT NULL,
    visitor_id VARCHAR(255), -- For anonymous tracking
    view_duration INT DEFAULT 0, -- in seconds
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Shopping cart table (persistent cart storage)
CREATE TABLE IF NOT EXISTS shopping_carts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    visitor_id VARCHAR(255), -- For anonymous carts
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_item (user_id, visitor_id, product_id)
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Insert sample products
INSERT IGNORE INTO products (name, description, price, category, brand, stock_quantity, image_url) VALUES
('Intel Core i7-13700K', 'High-performance desktop processor with 16 cores', 399.99, 'processors', 'Intel', 50, '/images/cpu.svg'),
('AMD Ryzen 7 7700X', 'Advanced desktop processor with 8 cores', 349.99, 'processors', 'AMD', 45, '/images/cpu.svg'),
('NVIDIA GeForce RTX 4070', 'High-end graphics card for gaming and content creation', 599.99, 'graphics', 'NVIDIA', 30, '/images/gpu.svg'),
('AMD Radeon RX 7600', 'Mid-range graphics card with excellent performance', 269.99, 'graphics', 'AMD', 25, '/images/gpu.svg'),
('Corsair Vengeance LPX 32GB DDR4', 'High-speed memory kit for gaming and productivity', 129.99, 'memory', 'Corsair', 60, '/images/ram.svg'),
('Kingston Fury Beast 16GB DDR4', 'Reliable memory solution for mainstream systems', 59.99, 'memory', 'Kingston', 80, '/images/ram.svg'),
('Noctua NH-D15', 'Premium CPU cooler with dual fan design', 99.99, 'cooling', 'Noctua', 40, '/images/cooler.svg'),
('Arctic Liquid Freezer II 280', 'All-in-one liquid CPU cooler', 79.99, 'cooling', 'Arctic', 35, '/images/cooler.svg'),
('Logitech MX Master 3', 'Advanced wireless mouse for productivity', 99.99, 'peripherals', 'Logitech', 70, '/images/peripherals.svg'),
('Razer BlackWidow V3', 'Mechanical gaming keyboard with RGB', 139.99, 'peripherals', 'Razer', 55, '/images/peripherals.svg');

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Indexes for tracking tables
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX idx_site_visits_user_id ON site_visits(user_id);
CREATE INDEX idx_site_visits_visitor_id ON site_visits(visitor_id);
CREATE INDEX idx_site_visits_page ON site_visits(page_url);
CREATE INDEX idx_site_visits_date ON site_visits(created_at);
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_visitor_id ON user_activities(visitor_id);
CREATE INDEX idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX idx_user_activities_date ON user_activities(created_at);
CREATE INDEX idx_product_views_product_id ON product_views(product_id);
CREATE INDEX idx_product_views_user_id ON product_views(user_id);
CREATE INDEX idx_product_views_date ON product_views(created_at);
CREATE INDEX idx_shopping_carts_user_id ON shopping_carts(user_id);
CREATE INDEX idx_shopping_carts_visitor_id ON shopping_carts(visitor_id);

-- Display success message
SELECT 'TechStore database setup completed successfully!' as Status;
