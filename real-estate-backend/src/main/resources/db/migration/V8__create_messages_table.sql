CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id BIGINT,
    sender_name VARCHAR(255),
    sender_email VARCHAR(255),
    sender_phone VARCHAR(50),
    recipient_id BIGINT,
    property_id BIGINT,
    subject VARCHAR(255),
    message_text TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_recipient (recipient_id),
    INDEX idx_sender (sender_id),
    INDEX idx_property (property_id)
); 