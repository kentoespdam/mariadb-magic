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

-- Insert minimal test data
INSERT INTO customers (id, email, first_name, last_name, phone) VALUES
(1, 'test1@example.com', 'Test', 'Customer', '123-456-7890'),
(2, 'test2@example.com', 'Test2', 'Customer2', '098-765-4321');

INSERT INTO orders (id, customer_id, order_number, total_amount, status) VALUES
(1, 1, 'ORD-001', 100.00, 'delivered'),
(2, 2, 'ORD-002', 200.00, 'shipped');

INSERT INTO order_items (id, order_id, product_name, quantity, unit_price) VALUES
(1, 1, 'Test Product A', 2, 25.00),
(2, 1, 'Test Product B', 1, 50.00);

-- Verify data
SELECT COUNT(*) as customer_count FROM customers;
SELECT COUNT(*) as order_count FROM orders;
SELECT COUNT(*) as item_count FROM order_items;