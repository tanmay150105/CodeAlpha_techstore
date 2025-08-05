-- TechStore Database Schema
-- Run this script to create your MySQL database

-- Create database
CREATE DATABASE IF NOT EXISTS techstore 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE techstore;

-- 1. Users table (for registration/login)
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

-- 2. Products table (for storing products)
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    image_url VARCHAR(500),
    stock_quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Orders table (for storing orders)
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Order Items table (for storing individual items in orders)
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Insert sample products
INSERT IGNORE INTO products (name, description, price, category, brand, stock_quantity, image_url) VALUES
-- Processors
('Intel Core i7-13700K', 'High-performance 16-core Raptor Lake processor', 38499.00, 'processors', 'Intel', 50, '/images/cpu.svg'),
('AMD Ryzen 7 7700X', '8-core Zen 4 CPU for gamers and creators', 31499.00, 'processors', 'AMD', 45, '/images/cpu.svg'),
('Intel Core i9-13900K', '24‑core flagship Raptor Lake processor', 43550.00, 'processors', 'Intel', 20, '/images/cpu.svg'),
('Intel Core i7-14700K', '20‑core Raptor Lake Refresh CPU for demanding workloads', 38499.00, 'processors', 'Intel', 25, '/images/cpu.svg'),
('AMD Ryzen 9 7900X', '12‑core Zen 4 CPU for gaming & content creation', 39999.00, 'processors', 'AMD', 18, '/images/cpu.svg'),

-- Graphics
('NVIDIA GeForce RTX 4070', 'Powerful GPU for 1440p gaming and creation', 57999.00, 'graphics', 'NVIDIA', 30, '/images/gpu.svg'),
('AMD Radeon RX 7600', 'Budget 1080p GPU with solid performance', 24999.00, 'graphics', 'AMD', 25, '/images/gpu.svg'),
('NVIDIA GeForce RTX 4080', 'Ultra-powerful GPU for 4K gaming', 115000.00, 'graphics', 'NVIDIA', 12, '/images/gpu.svg'),
('NVIDIA GeForce RTX 4070 Super', 'Efficient 1440p GPU with DLSS 3.5 support', 85500.00, 'graphics', 'NVIDIA', 15, '/images/gpu.svg'),
('AMD Radeon RX 7900 XTX', 'Flagship AMD GPU for high-end performance', 110000.00, 'graphics', 'AMD', 18, '/images/gpu.svg'),

-- Memory
('Corsair Vengeance LPX 32GB DDR4', 'Reliable high-speed DDR4 gaming memory', 4999.00, 'memory', 'Corsair', 60, '/images/ram.svg'),
('Kingston Fury Beast 16GB DDR4', 'Mainstream DDR4 RAM for everyday performance', 2699.00, 'memory', 'Kingston', 80, '/images/ram.svg'),
('Corsair Dominator Platinum RGB 16GB DDR4', 'Premium DDR4 RAM with RGB lighting', 8900.00, 'memory', 'Corsair', 50, '/images/ram.svg'),
('Corsair Vengeance DDR5 32GB 6000MHz', 'High‑speed DDR5 kit for multitasking', 7299.00, 'memory', 'Corsair', 30, '/images/ram.svg'),
('G.SKILL Trident Z5 32GB DDR5', 'Fast DDR5 memory with RGB lighting', 18500.00, 'memory', 'G.SKILL', 45, '/images/ram.svg'),

-- Cooling
('Noctua NH-D15', 'Dual-tower premium air CPU cooler', 9399.00, 'cooling', 'Noctua', 40, '/images/cooler.svg'),
('Arctic Liquid Freezer II 280', 'Efficient AIO CPU liquid cooler', 7999.00, 'cooling', 'Arctic', 35, '/images/cooler.svg'),
('be quiet! Dark Rock Pro 4', 'Silent and efficient dual‑tower air cooler', 18614.00, 'cooling', 'be quiet!', 30, '/images/cooler.svg'),
('Cooler Master ML240L V2 ARGB', '240mm ARGB liquid CPU cooler', 5799.00, 'cooling', 'Cooler Master', 20, '/images/cooler.svg'),
('DeepCool AK620', 'Dual‑tower air cooler for high performance', 6500.00, 'cooling', 'DeepCool', 40, '/images/cooler.svg'),

-- Peripherals
('Logitech MX Master 3', 'Advanced ergonomic wireless productivity mouse', 8999.00, 'peripherals', 'Logitech', 70, '/images/peripherals.svg'),
('Razer BlackWidow V3', 'Mechanical gaming keyboard with RGB lighting', 9999.00, 'peripherals', 'Razer', 55, '/images/peripherals.svg'),
('Logitech G502 X Lightspeed', 'Wireless gaming mouse with HERO sensor', 11795.00, 'peripherals', 'Logitech', 45, '/images/peripherals.svg'),
('Logitech G Pro X Superlight 2', 'Ultra‑lightweight pro‑grade gaming mouse', 15499.00, 'peripherals', 'Logitech', 15, '/images/peripherals.svg'),
('SteelSeries Arctis 7 Wireless', 'Premium headset with surround sound', 14999.00, 'peripherals', 'SteelSeries', 35, '/images/peripherals.svg');


-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Display success message
SELECT 'TechStore database setup completed successfully!' as Status;
