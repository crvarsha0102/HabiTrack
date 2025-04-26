package com.aymen.realestate.dto;

import lombok.Data;
import java.time.Instant;

/**
 * DTO for creating or updating meetings
 */
@Data
public class MeetingRequest {
    private Long participantId;    // ID of the user who will participate in the meeting
    private String title;          // Meeting title
    private String description;    // Optional meeting description
    private Instant meetingTime;   // When the meeting will take place
    private Integer durationMinutes; // Duration in minutes
    private String location;       // Physical location (optional)
    private String meetingLink;    // Virtual meeting link (optional)
    private Long propertyId;       // Related property ID (optional)
    private Long messageId;        // ID of the message this meeting is related to
} 