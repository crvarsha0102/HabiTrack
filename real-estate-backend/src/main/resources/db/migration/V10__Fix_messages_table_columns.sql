-- Add columns that might be missing
ALTER TABLE messages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS content VARCHAR(2000) NULL;

-- Make sure receiver_id column exists (rename from recipient_id if needed)
-- First check if recipient_id exists but receiver_id doesn't
SET @column_exists = (
  SELECT COUNT(*) 
  FROM information_schema.columns 
  WHERE table_schema = DATABASE() 
    AND table_name = 'messages' 
    AND column_name = 'recipient_id'
);

SET @receiver_exists = (
  SELECT COUNT(*) 
  FROM information_schema.columns 
  WHERE table_schema = DATABASE() 
    AND table_name = 'messages' 
    AND column_name = 'receiver_id'
);

-- If recipient_id exists but receiver_id doesn't, rename it
SET @stmt = IF(@column_exists > 0 AND @receiver_exists = 0, 
  'ALTER TABLE messages CHANGE COLUMN recipient_id receiver_id BIGINT', 
  'SELECT 1');
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- If message_text exists but content doesn't, copy data to content
SET @msg_text_exists = (
  SELECT COUNT(*) 
  FROM information_schema.columns 
  WHERE table_schema = DATABASE() 
    AND table_name = 'messages' 
    AND column_name = 'message_text'
);

SET @content_exists = (
  SELECT COUNT(*) 
  FROM information_schema.columns 
  WHERE table_schema = DATABASE() 
    AND table_name = 'messages' 
    AND column_name = 'content'
);

-- If message_text exists but content doesn't, copy the data
SET @stmt = IF(@msg_text_exists > 0 AND @content_exists = 0, 
  'UPDATE messages SET content = message_text WHERE content IS NULL', 
  'SELECT 1');
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Make sure not null constraints are in place
ALTER TABLE messages MODIFY COLUMN sender_id BIGINT NOT NULL;
ALTER TABLE messages MODIFY COLUMN receiver_id BIGINT NOT NULL;
ALTER TABLE messages MODIFY COLUMN property_id BIGINT NOT NULL;
ALTER TABLE messages MODIFY COLUMN is_read BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE messages MODIFY COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE messages MODIFY COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP; 