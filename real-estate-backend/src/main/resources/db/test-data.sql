-- Test Data for Real Estate Project
-- This script creates test users and listings for development/testing purposes

-- Clear existing test data if needed
DELETE FROM messages WHERE id > 0;
DELETE FROM listing_image_urls WHERE listing_id > 0;
DELETE FROM listings WHERE id > 0;
DELETE FROM users WHERE id > 0;

-- Create test users
-- Note: Password is 'password123' (Should be hashed in production)
INSERT INTO users (id, username, first_name, last_name, email, password, phone, avatar, created_at, updated_at, is_active) 
VALUES 
(1, 'John Smith', 'John', 'Smith', 'john.smith@example.com', '$2a$10$6hg/QTw8Th1G7uGzivYdxOtaUZHLAZp/hkZLJGX1VgMbzrAjCHKV6', '5551234567', 'https://randomuser.me/api/portraits/men/1.jpg', NOW(), NOW(), true),
(2, 'Jane Doe', 'Jane', 'Doe', 'jane.doe@example.com', '$2a$10$6hg/QTw8Th1G7uGzivYdxOtaUZHLAZp/hkZLJGX1VgMbzrAjCHKV6', '5559876543', 'https://randomuser.me/api/portraits/women/1.jpg', NOW(), NOW(), true);

-- Create listings for John Smith (User ID: 1)
INSERT INTO listings (id, name, description, address, city, state, zip_code, price, bathrooms, bedrooms, square_feet, furnished, parking, amenities, user_id, status, listing_type, property_type, created_at, updated_at) 
VALUES 
-- Listing 1: Apartment for Rent
(1, 'Modern Downtown Apartment', 'Beautiful modern apartment in the heart of downtown. Features open floor plan, stainless steel appliances, and a balcony with city views.', '123 Main St', 'Metropolis', 'NY', '10001', 2200.00, 2, 2, 1200, true, true, 'Gym,Pool,Concierge,Rooftop Deck', 1, 'ACTIVE', 'RENT', 'APARTMENT', NOW(), NOW()),

-- Listing 2: House for Sale
(2, 'Spacious Family Home', 'Gorgeous 4-bedroom home in a quiet neighborhood. Perfect for families with a large backyard, updated kitchen, and finished basement.', '456 Oak Avenue', 'Suburbia', 'CA', '90210', 750000.00, 3, 4, 2500, false, true, 'Backyard,Patio,Fireplace,Garage', 1, 'ACTIVE', 'SALE', 'HOUSE', NOW(), NOW()),

-- Listing 3: Land for Sale
(3, 'Development Land Opportunity', 'Prime development land with excellent location and development potential. Zoned for commercial or residential use.', '789 Hill Road', 'Greenfield', 'TX', '75001', 350000.00, 0, 0, 10000, false, false, 'Corner Lot,Utilities Available', 1, 'ACTIVE', 'SALE', 'LAND', NOW(), NOW());

-- Create listings for Jane Doe (User ID: 2)
INSERT INTO listings (id, name, description, address, city, state, zip_code, price, bathrooms, bedrooms, square_feet, furnished, parking, amenities, user_id, status, listing_type, property_type, created_at, updated_at) 
VALUES 
-- Listing 4: Luxury Condo for Sale
(4, 'Luxury Waterfront Condo', 'Stunning waterfront condo with panoramic views. Features high-end finishes, gourmet kitchen, and building amenities including spa and fitness center.', '101 Harbor View', 'Bayside', 'FL', '33101', 950000.00, 3, 3, 2000, true, true, 'Pool,Gym,Sauna,Doorman,Private Deck', 2, 'ACTIVE', 'SALE', 'CONDO', NOW(), NOW()),

-- Listing 5: Cottage for Rent
(5, 'Charming Cottage Retreat', 'Cozy cottage with rustic charm. Perfect weekend getaway with a wood-burning fireplace and peaceful garden setting.', '222 Pine Lane', 'Woodland', 'OR', '97001', 1800.00, 1, 1, 800, true, true, 'Garden,Fireplace,Patio', 2, 'ACTIVE', 'RENT', 'HOUSE', NOW(), NOW());

-- Add images to listings
INSERT INTO listing_image_urls (listing_id, image_order, image_url) 
VALUES 
-- Listing 1 images
(1, 0, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'),
(1, 1, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'),
(1, 2, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'),

-- Listing 2 images
(2, 0, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'),
(2, 1, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'),
(2, 2, 'https://images.unsplash.com/photo-1570129477492-45c003edd2be'),

-- Listing 3 images
(3, 0, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef'),
(3, 1, 'https://images.unsplash.com/photo-1500076656116-558758c991c1'),

-- Listing 4 images
(4, 0, 'https://images.unsplash.com/photo-1493809842364-78817add7ffb'),
(4, 1, 'https://images.unsplash.com/photo-1484154218962-a197022b5858'),
(4, 2, 'https://images.unsplash.com/photo-1484101403633-562f891dc89a'),

-- Listing 5 images
(5, 0, 'https://images.unsplash.com/photo-1518780664697-55e3ad937233'),
(5, 1, 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae');

-- Create initial messages between users
INSERT INTO messages (sender_id, sender_name, sender_email, sender_phone, receiver_id, property_id, subject, content, is_read, created_at, updated_at)
VALUES 
-- Jane inquires about John's apartment
(2, 'Jane Doe', 'jane.doe@example.com', '5559876543', 1, 1, 'Inquiry about Modern Downtown Apartment', 'Hi John, I am interested in your Modern Downtown Apartment. Is it still available for rent? I would like to schedule a viewing this weekend if possible. Thanks, Jane', false, NOW(), NOW()),

-- John inquires about Jane's luxury condo
(1, 'John Smith', 'john.smith@example.com', '5551234567', 2, 4, 'Interest in Luxury Waterfront Condo', 'Hello Jane, I\'m very interested in your waterfront condo listing. Could you provide more information about the HOA fees and amenities? I\'m also wondering if there are any upcoming special assessments. Thank you, John', false, NOW(), NOW()); 