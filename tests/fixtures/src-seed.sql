-- Reset auto-increment for deterministic IDs
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS customers;

SET FOREIGN_KEY_CHECKS = 1;

-- Customers table (source - no notes column)
CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Order items table
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Insert deterministic customer data (200 customers)
INSERT INTO customers (id, email, first_name, last_name, phone) VALUES
(1, 'john.doe@example.com', 'John', 'Doe', '+1-555-0101'),
(2, 'jane.smith@example.com', 'Jane', 'Smith', '+1-555-0102'),
(3, 'bob.johnson@example.com', 'Bob', 'Johnson', '+1-555-0103'),
(4, 'alice.wilson@example.com', 'Alice', 'Wilson', '+1-555-0104'),
(5, 'charlie.brown@example.com', 'Charlie', 'Brown', '+1-555-0105');

-- Generate remaining customers programmatically
SET @counter = 6;
WHILE @counter <= 200 DO
    INSERT INTO customers (id, email, first_name, last_name, phone) VALUES
    (@counter, 
     CONCAT('user', @counter, '@example.com'), 
     CONCAT('First', @counter), 
     CONCAT('Last', @counter), 
     CONCAT('+1-555-', LPAD(@counter + 100, 4, '0')));
    SET @counter = @counter + 1;
END WHILE;

-- Insert orders (2-3 orders per customer, ~500 total)
INSERT INTO orders (id, customer_id, order_number, total_amount, status) VALUES
(1, 1, 'ORD-2024-0001', 299.99, 'delivered'),
(2, 1, 'ORD-2024-0002', 149.50, 'shipped'),
(3, 2, 'ORD-2024-0003', 599.99, 'processing'),
(4, 2, 'ORD-2024-0004', 89.99, 'delivered'),
(5, 3, 'ORD-2024-0005', 199.99, 'pending');

-- Generate remaining orders programmatically
SET @order_counter = 6;
SET @customer_id = 1;
WHILE @order_counter <= 500 DO
    INSERT INTO orders (id, customer_id, order_number, total_amount, status) VALUES
    (@order_counter,
     @customer_id,
     CONCAT('ORD-2024-', LPAD(@order_counter, 4, '0')),
     ROUND(RAND() * 500 + 50, 2),
     ELT(FLOOR(RAND() * 5) + 1, 'pending', 'processing', 'shipped', 'delivered', 'cancelled'));
    
    SET @customer_id = IF(@customer_id >= 200, 1, @customer_id + 1);
    SET @order_counter = @order_counter + 1;
END WHILE;

-- Insert order items (2-5 items per order, ~1500 total)
INSERT INTO order_items (id, order_id, product_name, quantity, unit_price) VALUES
(1, 1, 'Wireless Headphones', 1, 199.99),
(2, 1, 'Phone Case', 2, 49.99),
(3, 2, 'USB Cable', 3, 19.99),
(4, 3, 'Smart Watch', 1, 399.99),
(5, 3, 'Charging Dock', 1, 199.99);

-- Generate remaining order items programmatically
SET @item_counter = 6;
SET @order_id = 1;
SET @items_per_order = 1;
WHILE @item_counter <= 1500 DO
    INSERT INTO order_items (id, order_id, product_name, quantity, unit_price) VALUES
    (@item_counter,
     @order_id,
     CONCAT('Product ', FLOOR(RAND() * 100)),
     FLOOR(RAND() * 5) + 1,
     ROUND(RAND() * 200 + 10, 2));
    
    SET @items_per_order = @items_per_order + 1;
    IF @items_per_order > 5 THEN
        SET @order_id = @order_id + 1;
        SET @items_per_order = 1;
    END IF;
    SET @item_counter = @item_counter + 1;
END WHILE;

-- Reset auto-increment counters
ALTER TABLE customers AUTO_INCREMENT = 201;
ALTER TABLE orders AUTO_INCREMENT = 501;
ALTER TABLE order_items AUTO_INCREMENT = 1501;

-- Verify data counts
SELECT 'customers' as table_name, COUNT(*) as count FROM customers
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items;