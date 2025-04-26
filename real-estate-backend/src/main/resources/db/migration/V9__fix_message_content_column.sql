-- Ensure message_text column is properly configured
ALTER TABLE messages MODIFY message_text TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL; 