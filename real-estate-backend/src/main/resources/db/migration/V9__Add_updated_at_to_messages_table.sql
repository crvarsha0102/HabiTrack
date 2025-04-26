-- Add updated_at column to messages table
ALTER TABLE messages ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Also fix the receiver_id column if it doesn't exist (since we saw recipient_id in the schema)
ALTER TABLE messages CHANGE COLUMN recipient_id receiver_id BIGINT;

-- Fix content column name if it doesn't match
ALTER TABLE messages CHANGE COLUMN message_text content TEXT; 