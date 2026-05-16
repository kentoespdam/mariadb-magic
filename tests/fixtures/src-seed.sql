#!/bin/bash
# Enhanced seed data with more realistic test scenarios

-- Reset auto-increment for deterministic IDs
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS customers;

SET FOREIGN_KEY_CHECKS = 1;

-- Create tables with minimal data for testing
CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Insert test data with more realistic scenarios
INSERT INTO customers (id, email, first_name, last_name, phone) VALUES
(1, 'alice.johnson@example.com', 'Alice', 'Johnson', '555-001-1234'),
(2, 'bob.smith@example.com', 'Bob', 'Smith', '555-002-5678'),
(3, 'charlie.brown@example.com', 'Charlie', 'Brown', '555-003-9012'),
(4, 'diana.prince@example.com', 'Diana', 'Prince', '555-004-3456'),
(5, 'edward.nigma@example.com', 'Edward', 'Nigma', '555-005-7890');

INSERT INTO orders (id, customer_id, order_number, total_amount, status) VALUES
(1, 1, 'ORD-2024-001', 299.99, 'delivered'),
(2, 1, 'ORD-2024-002', 149.50, 'processing'),
(3, 2, 'ORD-2024-003', 89.99, 'shipped'),
(4, 3, 'ORD-2024-004', 199.99, 'pending'),
(5, 4, 'ORD-2024-005', 450.00, 'delivered'),
(6, 5, 'ORD-2024-006', 75.25, 'cancelled');

INSERT INTO order_items (id, order_id, product_name, quantity, unit_price) VALUES
(1, 1, 'Wireless Headphones', 1, 89.99),
(2, 1, 'Bluetooth Speaker', 2, 105.00),
(3, 2, 'Phone Case', 1, 29.99),
(4, 2, 'Screen Protector', 1, 19.99),
(5, 2, 'Charging Cable', 1, 9.52),
(6, 3, 'Book: Advanced Go Programming', 1, 89.99),
(7, 4, 'Desk Lamp', 1, 39.99),
(8, 4, 'Notebook', 2, 79.99),
(9, 4, 'Pen Set', 3, 5.00),
(10, 5, 'Mechanical Keyboard', 1, 199.99),
(11, 5, 'Mouse', 1, 49.99),
(12, 5, 'Monitor Stand', 1, 100.02),
(13, 6, 'USB Cable', 1, 5.25),
(14, 6, 'Adapter', 1, 70.00);

-- Verify data
SELECT 'customers' as table_name, COUNT(*) as count FROM customers
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items;