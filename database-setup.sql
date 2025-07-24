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
INSERT IGNORE INTO products (name, description, price, category, brand, stock_quantity) VALUES
('Intel Core i7-13700K', 'High-performance desktop processor with 16 cores', 399.99, 'processors', 'Intel', 50),
('AMD Ryzen 7 7700X', 'Advanced desktop processor with 8 cores', 349.99, 'processors', 'AMD', 45),
('NVIDIA GeForce RTX 4070', 'High-end graphics card for gaming and content creation', 599.99, 'graphics', 'NVIDIA', 30),
('AMD Radeon RX 7600', 'Mid-range graphics card with excellent performance', 269.99, 'graphics', 'AMD', 25),
('Corsair Vengeance LPX 32GB DDR4', 'High-speed memory kit for gaming and productivity', 129.99, 'memory', 'Corsair', 60),
('Kingston Fury Beast 16GB DDR4', 'Reliable memory solution for mainstream systems', 59.99, 'memory', 'Kingston', 80),
('Noctua NH-D15', 'Premium CPU cooler with dual fan design', 99.99, 'cooling', 'Noctua', 40),
('Arctic Liquid Freezer II 280', 'All-in-one liquid CPU cooler', 79.99, 'cooling', 'Arctic', 35),
('Logitech MX Master 3', 'Advanced wireless mouse for productivity', 99.99, 'peripherals', 'Logitech', 70),
('Razer BlackWidow V3', 'Mechanical gaming keyboard with RGB', 139.99, 'peripherals', 'Razer', 55);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Display success message
SELECT 'TechStore database setup completed successfully!' as Status;
