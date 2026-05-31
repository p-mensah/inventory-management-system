-- =====================================================
-- JUBEL HAVILAH ENTERPRISE - Seed Data
-- Run this after schema.sql to populate initial data
-- =====================================================

-- =====================================================
-- SUPPLIERS
-- =====================================================
INSERT INTO public.suppliers (name, contact_person, email, phone, address) VALUES
('Golden Star Trading', 'Kofi Mensah', 'kofi@goldenstar.gh', '+233-20-123-4567', 'Accra, Ring Road'),
('Quality Foods Ltd', 'Ama Serwaa', 'ama@qualityfoods.gh', '+233-24-987-6543', 'Kumasi, Adum'),
('Fresh Farm Produce', 'Kwame Asante', 'kwame@freshfarm.gh', '+233-27-555-1234', 'Tema, Community 1'),
('Prime Distributors', 'Akua Boateng', 'akua@prime.gh', '+233-50-111-2222', 'Takoradi, Market Circle'),
('Global Imports GH', 'Yaw Owusu', 'yaw@globalimports.gh', '+233-26-333-4444', 'Kasoa, New Road');

-- =====================================================
-- PRODUCTS
-- =====================================================
INSERT INTO public.products (name, sku, category, supplier_id, cost, price, quantity, low_stock_threshold, expiration_date) VALUES
-- Beverages
('Coca-Cola 500ml', 'BEV-001', 'Beverages', 1, 3.50, 5.00, 150, 20, NOW() + INTERVAL '6 months'),
('Fanta Orange 500ml', 'BEV-002', 'Beverages', 1, 3.50, 5.00, 120, 20, NOW() + INTERVAL '6 months'),
('Malta Guinness', 'BEV-003', 'Beverages', 1, 4.00, 6.00, 80, 15, NOW() + INTERVAL '6 months'),
('Sprite 500ml', 'BEV-004', 'Beverages', 1, 3.50, 5.00, 100, 20, NOW() + INTERVAL '6 months'),
('Alvaro 330ml', 'BEV-005', 'Beverages', 1, 5.00, 8.00, 60, 15, NOW() + INTERVAL '4 months'),

-- Snacks
('Peak Milk 400g', 'SNK-001', 'Dairy', 2, 15.00, 20.00, 50, 10, NOW() + INTERVAL '12 months'),
('Ideal Milk 170g', 'SNK-002', 'Dairy', 2, 8.00, 12.00, 80, 15, NOW() + INTERVAL '12 months'),
('Milo 400g', 'SNK-003', 'Beverages', 2, 25.00, 35.00, 40, 10, NOW() + INTERVAL '18 months'),
('Nescafe 200g', 'SNK-004', 'Beverages', 2, 30.00, 42.00, 35, 8, NOW() + INTERVAL '18 months'),

-- Rice & Grains
('Jasmine Rice 5kg', 'RCE-001', 'Grains', 3, 80.00, 100.00, 25, 5, NOW() + INTERVAL '12 months'),
('Basmati Rice 5kg', 'RCE-002', 'Grains', 3, 90.00, 115.00, 20, 5, NOW() + INTERVAL '12 months'),
('Local Rice 5kg', 'RCE-003', 'Grains', 3, 60.00, 75.00, 30, 8, NOW() + INTERVAL '10 months'),

-- Cooking Oils
('Frytol Oil 5L', 'OIL-001', 'Cooking Oil', 4, 120.00, 150.00, 15, 5, NOW() + INTERVAL '12 months'),
('Kings Oil 5L', 'OIL-002', 'Cooking Oil', 4, 110.00, 140.00, 20, 5, NOW() + INTERVAL '12 months'),
('Gino Tomato Paste 400g', 'CND-001', 'Canned Goods', 4, 8.00, 12.00, 100, 20, NOW() + INTERVAL '24 months'),

-- Personal Care
('Dettol Soap 175g', 'PRS-001', 'Personal Care', 5, 10.00, 15.00, 60, 15, NOW() + INTERVAL '36 months'),
('Lifebuoy Soap', 'PRS-002', 'Personal Care', 5, 8.00, 12.00, 80, 15, NOW() + INTERVAL '36 months'),
('Close Up Toothpaste', 'PRS-003', 'Personal Care', 5, 12.00, 18.00, 45, 10, NOW() + INTERVAL '24 months'),

-- Low stock items (for testing alerts)
('Premium Olive Oil 1L', 'OIL-003', 'Cooking Oil', 4, 85.00, 110.00, 3, 5, NOW() + INTERVAL '6 months'),
('Imported Cheese 500g', 'DRY-001', 'Dairy', 5, 60.00, 80.00, 2, 5, NOW() + INTERVAL '1 month'),

-- Out of stock (for testing)
('Special Edition Coffee', 'BEV-010', 'Beverages', 2, 50.00, 70.00, 0, 5, NOW() + INTERVAL '12 months');

-- =====================================================
-- SAMPLE TRANSACTIONS (Last 7 days)
-- =====================================================
INSERT INTO public.transactions (product_id, type, quantity_change, price_per_unit, notes, "user", date) VALUES
-- Today's transactions
(1, 'Sale', -5, 5.00, 'Walk-in customer', 'Staff User', NOW() - INTERVAL '2 hours'),
(2, 'Sale', -3, 5.00, 'Walk-in customer', 'Staff User', NOW() - INTERVAL '3 hours'),
(6, 'Sale', -2, 20.00, 'Regular customer', 'Staff User', NOW() - INTERVAL '4 hours'),
(8, 'Sale', -1, 35.00, 'Bulk purchase', 'Admin User', NOW() - INTERVAL '5 hours'),

-- Yesterday
(1, 'Sale', -10, 5.00, 'Bulk order', 'Staff User', NOW() - INTERVAL '1 day'),
(3, 'Sale', -6, 6.00, 'Party order', 'Staff User', NOW() - INTERVAL '1 day'),
(10, 'Sale', -2, 100.00, 'Rice sale', 'Admin User', NOW() - INTERVAL '1 day'),
(13, 'Purchase', 20, 120.00, 'Restocking', 'Admin User', NOW() - INTERVAL '1 day'),

-- This week
(15, 'Sale', -10, 12.00, 'Bulk canned goods', 'Staff User', NOW() - INTERVAL '2 days'),
(16, 'Sale', -5, 15.00, 'Soap sale', 'Staff User', NOW() - INTERVAL '2 days'),
(1, 'Purchase', 50, 3.50, 'Weekly restock', 'Admin User', NOW() - INTERVAL '3 days'),
(2, 'Purchase', 40, 3.50, 'Weekly restock', 'Admin User', NOW() - INTERVAL '3 days'),
(6, 'Purchase', 30, 15.00, 'Milk restock', 'Admin User', NOW() - INTERVAL '4 days'),

-- Adjustments
(19, 'Adjustment', -2, NULL, 'Damaged goods', 'Admin User', NOW() - INTERVAL '5 days'),
(20, 'Adjustment', -1, NULL, 'Expired product', 'Admin User', NOW() - INTERVAL '6 days');

-- =====================================================
-- SAMPLE AUDIT LOGS
-- =====================================================
INSERT INTO public.audit_logs (user_name, action, target_name, details, created_at) VALUES
('Admin User', 'LOGIN', 'System', 'User logged in successfully', NOW() - INTERVAL '1 hour'),
('Staff User', 'LOGIN', 'System', 'User logged in successfully', NOW() - INTERVAL '2 hours'),
('Admin User', 'CREATE', 'Product', 'Created new product: Special Edition Coffee', NOW() - INTERVAL '1 day'),
('Admin User', 'UPDATE', 'Product', 'Updated stock for: Coca-Cola 500ml (+50 units)', NOW() - INTERVAL '3 days'),
('Staff User', 'SALE', 'Transaction', 'Recorded sale of 10 items totaling GHS 50.00', NOW() - INTERVAL '1 day'),
('Admin User', 'CREATE', 'Supplier', 'Added new supplier: Global Imports GH', NOW() - INTERVAL '5 days');

-- =====================================================
-- SAMPLE PURCHASE ORDERS
-- =====================================================
INSERT INTO public.purchase_orders (supplier_id, items, status, total_cost, notes, created_at) VALUES
(1, '[{"product_id": 1, "quantity": 100, "cost": 3.50}, {"product_id": 2, "quantity": 80, "cost": 3.50}]', 'Received', 630.00, 'Weekly beverage restock', NOW() - INTERVAL '7 days'),
(2, '[{"product_id": 6, "quantity": 50, "cost": 15.00}, {"product_id": 8, "quantity": 30, "cost": 25.00}]', 'Shipped', 1500.00, 'Dairy and beverage order', NOW() - INTERVAL '2 days'),
(3, '[{"product_id": 10, "quantity": 20, "cost": 80.00}, {"product_id": 11, "quantity": 15, "cost": 90.00}]', 'Pending', 2950.00, 'Rice bulk order', NOW() - INTERVAL '1 day');

-- =====================================================
-- DONE! Sample data has been inserted.
-- =====================================================
