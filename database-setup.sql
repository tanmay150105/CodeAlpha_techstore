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
INSERT IGNORE INTO products (name, description, price, category, brand, stock_quantity,image_url) VALUES
-- 🧠 Processors
('Intel Core i7-13700K', 'High-performance desktop processor with 16 cores', 399.99, 'processors', 'Intel', 50, '/images/cpu.svg'),
('AMD Ryzen 7 7700X', 'Advanced desktop processor with 8 cores', 349.99, 'processors', 'AMD', 45, '/images/cpu.svg'),
('Intel Core i5-13600K', 'Efficient mid-range processor with 14 cores', 319.99, 'processors', 'Intel', 40, '/images/cpu.svg'),
('AMD Ryzen 5 7600X', 'Affordable 6-core processor for gaming and work', 249.99, 'processors', 'AMD', 50, '/images/cpu.svg'),
('Intel Core i9-13900K', 'Flagship CPU with top-tier performance', 599.99, 'processors', 'Intel', 20, '/images/cpu.svg'),
('AMD Ryzen 9 7950X', 'Ultra high-end CPU for enthusiasts and creators', 699.99, 'processors', 'AMD', 15, '/images/cpu.svg'),
-- 🎮 Graphics Cards
('NVIDIA GeForce RTX 4070', 'High-end graphics card for gaming and content creation', 599.99, 'graphics', 'NVIDIA', 30, '/images/gpu.svg'),
('AMD Radeon RX 7600', 'Mid-range graphics card with excellent performance', 269.99, 'graphics', 'AMD', 25, '/images/gpu.svg'),
('NVIDIA GeForce RTX 4060 Ti', 'Next-gen 1080p GPU with DLSS support', 399.99, 'graphics', 'NVIDIA', 35, '/images/gpu.svg'),
('AMD Radeon RX 6700 XT', 'Strong 1440p performer at great value', 389.99, 'graphics', 'AMD', 28, '/images/gpu.svg'),
('NVIDIA GeForce RTX 4080', 'Powerful GPU for 4K gaming', 1199.99, 'graphics', 'NVIDIA', 10, '/images/gpu.svg'),
('AMD Radeon RX 7900 XTX', 'Top-tier GPU for demanding tasks', 999.99, 'graphics', 'AMD', 12, '/images/gpu.svg'),
-- 💾 Memory (RAM)
('Corsair Vengeance LPX 32GB DDR4', 'High-speed memory kit for gaming and productivity', 129.99, 'memory', 'Corsair', 60, '/images/ram.svg'),
('Kingston Fury Beast 16GB DDR4', 'Reliable memory solution for mainstream systems', 59.99, 'memory', 'Kingston', 80, '/images/ram.svg'),
('G.Skill Trident Z RGB 32GB DDR4', 'Stylish RGB memory with high speed', 139.99, 'memory', 'G.Skill', 70, '/images/ram.svg'),
('Corsair Dominator Platinum 16GB DDR5', 'Premium DDR5 RAM with RGB lighting', 109.99, 'memory', 'Corsair', 40, '/images/ram.svg'),
('TeamGroup T-Force Delta RGB 32GB', 'Reliable RAM with RGB and solid latency', 124.99, 'memory', 'TeamGroup', 50, '/images/ram.svg'),
('ADATA XPG Spectrix D41 16GB', 'Affordable DDR4 memory with RGB', 69.99, 'memory', 'ADATA', 60, '/images/ram.svg'),
-- ❄️ Cooling
('Noctua NH-D15', 'Premium CPU cooler with dual fan design', 99.99, 'cooling', 'Noctua', 40, '/images/cooler.svg'),
('Arctic Liquid Freezer II 280', 'All-in-one liquid CPU cooler', 79.99, 'cooling', 'Arctic', 35, '/images/cooler.svg'),
('Cooler Master Hyper 212 Black Edition', 'Affordable air cooler for most CPUs', 49.99, 'cooling', 'Cooler Master', 45, '/images/cooler.svg'),
('NZXT Kraken X63', 'RGB liquid cooling solution', 139.99, 'cooling', 'NZXT', 25, '/images/cooler.svg'),
('be quiet! Dark Rock Pro 4', 'Silent air cooler with dual tower design', 89.99, 'cooling', 'be quiet!', 30, '/images/cooler.svg'),
('Thermaltake TH240 ARGB', 'RGB AIO liquid cooler for gaming rigs', 119.99, 'cooling', 'Thermaltake', 20, '/images/cooler.svg'),
-- 🎧 Peripherals
('Logitech MX Master 3', 'Advanced wireless mouse for productivity', 99.99, 'peripherals', 'Logitech', 70, '/images/peripherals.svg'),
('Razer BlackWidow V3', 'Mechanical gaming keyboard with RGB', 139.99, 'peripherals', 'Razer', 55, '/images/peripherals.svg'),
('SteelSeries Arctis 7 Wireless Headset', 'Premium gaming headset with surround sound', 149.99, 'peripherals', 'SteelSeries', 35, '/images/peripherals.svg'),
('Corsair K95 RGB Platinum XT', 'Mechanical keyboard with macro keys', 189.99, 'peripherals', 'Corsair', 25, '/images/peripherals.svg'),
('Logitech G502 X Lightspeed', 'Wireless gaming mouse with customizable weights', 159.99, 'peripherals', 'Logitech', 45, '/images/peripherals.svg'),
('Elgato Stream Deck MK.2', 'Customizable LCD control pad for streamers', 169.99, 'peripherals', 'Elgato', 20, '/images/peripherals.svg');

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Display success message
SELECT 'TechStore database setup completed successfully!' as Status;
