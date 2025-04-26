package com.aymen.realestate.util;

import com.aymen.realestate.dto.MessageDTO;
import com.aymen.realestate.model.Listing;
import com.aymen.realestate.model.Message;
import com.aymen.realestate.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Utility class for mapping Message entities to MessageDTOs
 * to avoid LazyInitializationException when serializing
 */
public class MessageDTOMapper {
    private static final Logger logger = LoggerFactory.getLogger(MessageDTOMapper.class);
    
    /**
     * Convert a Message entity to a MessageDTO
     * Safely handles lazy-loaded relationships
     */
    public static MessageDTO toDTO(Message message) {
        if (message == null) {
            return null;
        }
        
        MessageDTO dto = new MessageDTO();
        
        // Set basic fields
        dto.setId(message.getId());
        dto.setSubject(message.getSubject());
        dto.setContent(message.getContent() != null ? message.getContent() : message.getMessageText());
        dto.setRead(message.isRead());
        dto.setCreatedAt(message.getCreatedAt());
        dto.setUpdatedAt(message.getUpdatedAt());
        
        // Set property ID
        dto.setPropertyId(message.getPropertyId());
        
        // Safely get sender information
        try {
            User sender = message.getSender();
            if (sender != null) {
                dto.setSenderId(sender.getId());
                dto.setSenderName(sender.getFirstName() + " " + sender.getLastName());
                dto.setSenderEmail(sender.getEmail());
                dto.setSenderPhone(sender.getPhone());
            } else {
                // Fallback to values stored directly in message
                dto.setSenderId(message.getSenderId());
                dto.setSenderName(message.getSenderName());
                dto.setSenderEmail(message.getSenderEmail());
                dto.setSenderPhone(message.getSenderPhone());
            }
        } catch (Exception e) {
            logger.warn("Error accessing sender information: {}", e.getMessage());
            // Fallback to values stored directly in message
            dto.setSenderId(message.getSenderId());
            dto.setSenderName(message.getSenderName());
            dto.setSenderEmail(message.getSenderEmail());
            dto.setSenderPhone(message.getSenderPhone());
        }
        
        // Safely get recipient information
        try {
            User recipient = message.getReceiver();
            if (recipient != null) {
                dto.setRecipientId(recipient.getId());
                dto.setRecipientName(recipient.getFirstName() + " " + recipient.getLastName());
            } else {
                dto.setRecipientId(message.getRecipientId());
            }
        } catch (Exception e) {
            logger.warn("Error accessing recipient information: {}", e.getMessage());
            dto.setRecipientId(message.getRecipientId());
        }
        
        // Safely get property information
        try {
            Listing property = message.getProperty();
            if (property != null) {
                dto.setPropertyId(property.getId());
                dto.setPropertyName(property.getName());
                
                // Get first image URL if available
                if (property.getImageUrls() != null && !property.getImageUrls().isEmpty()) {
                    dto.setPropertyImageUrl(property.getImageUrls().get(0));
                } else {
                    // Set default image when no images available
                    dto.setPropertyImageUrl("/assets/images/prpty.jpg");
                }
            } else if (message.getPropertyId() != null) {
                // Even if property object isn't available, still set property ID
                dto.setPropertyId(message.getPropertyId());
                
                // Set default image
                dto.setPropertyImageUrl("/assets/images/prpty.jpg");
            }
        } catch (Exception e) {
            logger.warn("Error accessing property information: {}", e.getMessage());
            // Property ID already set above
            
            // Set default image
            dto.setPropertyImageUrl("/assets/images/prpty.jpg");
        }
        
        return dto;
    }
    
    /**
     * Convert a list of Message entities to a list of MessageDTOs
     */
    public static List<MessageDTO> toDTOList(List<Message> messages) {
        if (messages == null) {
            return new ArrayList<>();
        }
        
        return messages.stream()
                .map(MessageDTOMapper::toDTO)
                .collect(Collectors.toList());
    }
} 