package com.aymen.realestate.util;

import com.aymen.realestate.dto.MessageRequest;
import com.aymen.realestate.model.Listing;
import com.aymen.realestate.model.Message;
import com.aymen.realestate.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Utility class to help map between message DTOs and entities
 */
public class MessageMapper {
    private static final Logger logger = LoggerFactory.getLogger(MessageMapper.class);
    
    /**
     * Maps a MessageRequest to a Message entity
     */
    public static Message toEntity(MessageRequest request, User sender, User receiver, Listing property) {
        Message message = new Message();
        
        // Set sender info
        message.setSender(sender);
        
        // For guest users or additional contact info
        if (request.getName() != null) {
            message.setSenderName(request.getName());
        } else if (sender != null) {
            message.setSenderName(sender.getFullName());
        }
        
        if (request.getEmail() != null) {
            message.setSenderEmail(request.getEmail());
        } else if (sender != null) {
            message.setSenderEmail(sender.getEmail());
        }
        
        if (request.getPhone() != null) {
            message.setSenderPhone(request.getPhone());
        }
        
        // Set recipient
        message.setReceiver(receiver);
        
        // Set property info
        message.setPropertyId(request.getPropertyId());
        if (property != null) {
            message.setProperty(property);
        }
        
        // Set message content - Ensure this is not null to avoid database error
        if (request.getMessage() != null && !request.getMessage().isEmpty()) {
            // Set both fields to ensure consistency
            message.setContent(request.getMessage());
            // The setContent method already sets messageText with the same value
        } else {
            logger.warn("Message content is empty or null, this may cause database errors");
            // Set a default value to avoid null errors
            message.setContent("No content provided");
            // The setContent method already sets messageText with the same value
        }
        
        message.setSubject(request.getSubject());
        
        logger.debug("Created message entity: sender={}, recipient={}, property={}, contentLength={}, subject='{}'",
                sender != null ? sender.getId() : "guest",
                receiver.getId(),
                request.getPropertyId(),
                request.getMessage() != null ? request.getMessage().length() : 0,
                request.getSubject());
        
        return message;
    }
} 