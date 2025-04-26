package com.aymen.realestate.dto;

import lombok.Data;

/**
 * DTO for sending messages
 * Fields align with the frontend contact form and map to Message entity
 */
@Data
public class MessageRequest {
    private Long recipientId;     // ID of message recipient
    private Long senderId;        // ID of message sender (if authenticated user)
    private String name;          // Sender's name (maps to senderName)
    private String email;         // Sender's email (maps to senderEmail)
    private String phone;         // Sender's phone (maps to senderPhone)
    private String message;       // Message content (maps to content/messageText)
    private String subject;       // Message subject
    private Long propertyId;      // Related property ID
} 