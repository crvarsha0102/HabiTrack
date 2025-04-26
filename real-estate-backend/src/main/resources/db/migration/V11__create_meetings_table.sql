CREATE TABLE meetings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    creator_id BIGINT NOT NULL,
    participant_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    meeting_time TIMESTAMP NOT NULL,
    duration_minutes INT DEFAULT 30,
    location VARCHAR(255),
    meeting_link VARCHAR(255),
    property_id BIGINT,
    message_id BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    creator_notified BOOLEAN NOT NULL DEFAULT FALSE,
    participant_notified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (creator_id) REFERENCES users(id),
    FOREIGN KEY (participant_id) REFERENCES users(id),
    FOREIGN KEY (property_id) REFERENCES listings(id) ON DELETE SET NULL,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE SET NULL
);

-- Add an index for faster meeting lookups
CREATE INDEX idx_meetings_creator ON meetings(creator_id);
CREATE INDEX idx_meetings_participant ON meetings(participant_id);
CREATE INDEX idx_meetings_property ON meetings(property_id);
CREATE INDEX idx_meetings_message ON meetings(message_id);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meetings_time ON meetings(meeting_time); 