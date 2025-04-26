-- Update message table to ensure message content is properly handled

-- First, ensure content field exists with correct type
ALTER TABLE messages MODIFY content VARCHAR(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL;

-- Copy data from message_text to content where content is null
UPDATE messages SET content = message_text WHERE content IS NULL AND message_text IS NOT NULL;

-- Copy data from content to message_text where message_text is null
UPDATE messages SET message_text = content WHERE message_text IS NULL AND content IS NOT NULL;

-- Fix the column relationship between recipient_id and receiver_id
ALTER TABLE messages MODIFY recipient_id BIGINT NULL;
ALTER TABLE messages MODIFY receiver_id BIGINT NULL;

-- Copy data between recipient_id and receiver_id
UPDATE messages SET recipient_id = receiver_id WHERE recipient_id IS NULL AND receiver_id IS NOT NULL;
UPDATE messages SET receiver_id = recipient_id WHERE receiver_id IS NULL AND recipient_id IS NOT NULL;

-- Change column definitions
ALTER TABLE messages MODIFY message_text VARCHAR(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;
ALTER TABLE messages MODIFY content VARCHAR(2000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;
ALTER TABLE messages MODIFY receiver_id BIGINT NOT NULL; 