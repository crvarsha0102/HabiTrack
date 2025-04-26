package com.aymen.realestate.service;

import com.aymen.realestate.model.Message;
import com.aymen.realestate.model.User;
import com.aymen.realestate.model.Listing;
import com.aymen.realestate.repository.MessageRepository;
import com.aymen.realestate.repository.UserRepository;
import com.aymen.realestate.repository.ListingRepository;
import com.aymen.realestate.exception.UserNotFoundException;
import com.aymen.realestate.exception.ListingNotFoundException;
import com.aymen.realestate.dto.MessageRequest;
import com.aymen.realestate.util.MessageMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Service
public class MessageService {
    
    private static final Logger logger = LoggerFactory.getLogger(MessageService.class);
    
    @Autowired
    private MessageRepository messageRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ListingRepository listingRepository;
    
    public Message sendMessage(Long senderId, Long receiverId, Long propertyId, String content) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new UserNotFoundException("Sender not found with id: " + senderId));
        
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new UserNotFoundException("Receiver not found with id: " + receiverId));
        
        Listing property = null;
        try {
            property = listingRepository.findById(propertyId)
                    .orElse(null); // Don't throw exception if property not found
        } catch (Exception e) {
            logger.warn("Error finding property with id: " + propertyId, e);
        }
        
        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setPropertyId(propertyId);
        
        if (property != null) {
            message.setProperty(property);
        }
        
        message.setContent(content);
        
        try {
            return messageRepository.save(message);
        } catch (Exception e) {
            logger.error("Database error saving message: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    public Message createMessage(MessageRequest request) {
        try {
            // Log incoming request for diagnostic purposes
            logger.debug("Creating message from request: recipientId={}, senderId={}, propertyId={}, hasMessage={}, messageLength={}", 
                request.getRecipientId(), 
                request.getSenderId(),
                request.getPropertyId(),
                request.getMessage() != null,
                request.getMessage() != null ? request.getMessage().length() : 0);
            
            // Validate message content - this should map to content/messageText fields
            if (request.getMessage() == null || request.getMessage().isEmpty()) {
                throw new IllegalArgumentException("Message content is required");
            }
            
            User sender = null;
            
            // Check if this is a message from registered user or guest
            if (request.getSenderId() != null) {
                // Message from registered user
                sender = userRepository.findById(request.getSenderId())
                        .orElseThrow(() -> new UserNotFoundException("Sender not found with id: " + request.getSenderId()));
            }
            
            User receiver = userRepository.findById(request.getRecipientId())
                    .orElseThrow(() -> new UserNotFoundException("Recipient not found with id: " + request.getRecipientId()));
            
            // Attempt to find the property, but continue even if not found
            Listing property = null;
            if (request.getPropertyId() != null) {
                try {
                    property = listingRepository.findById(request.getPropertyId()).orElse(null);
                } catch (Exception e) {
                    logger.warn("Error finding property with id: " + request.getPropertyId(), e);
                }
            }
            
            // Use the mapper to create a consistent entity
            Message message = MessageMapper.toEntity(request, sender, receiver, property);
            
            // Extra validation to ensure content and messageText are set correctly
            if (message.getContent() == null || message.getContent().isEmpty()) {
                logger.error("Message content is still null or empty after mapping - this will fail in the database");
                message.setContent(request.getMessage()); // Directly set from request as fallback
            }
            
            // Ensure messageText is also set correctly
            if (message.getMessageText() == null || message.getMessageText().isEmpty()) {
                logger.debug("Setting messageText from content");
                message.setMessageText(message.getContent());
            }
            
            try {
                logger.debug("Saving message to database: content={}, messageText={}, sender={}, receiver={}, property={}",
                    message.getContent() != null ? message.getContent().substring(0, Math.min(20, message.getContent().length())) + "..." : null,
                    message.getMessageText() != null ? message.getMessageText().substring(0, Math.min(20, message.getMessageText().length())) + "..." : null,
                    message.getSenderId(),
                    message.getRecipientId(),
                    message.getPropertyId());
                    
                return messageRepository.save(message);
            } catch (Exception e) {
                logger.error("Database error saving message: {}", e.getMessage(), e);
                throw e;
            }
        } catch (Exception e) {
            logger.error("Error creating message", e);
            throw e;
        }
    }
    
    public List<Message> getSentMessages(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        
        return messageRepository.findBySenderOrderByCreatedAtDesc(user);
    }
    
    public List<Message> getReceivedMessages(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        
        return messageRepository.findByReceiverOrderByCreatedAtDesc(user);
    }
    
    public List<Message> getMessagesBySenderId(Long userId) {
        return getSentMessages(userId);
    }
    
    public List<Message> getMessagesByRecipientId(Long userId) {
        return getReceivedMessages(userId);
    }
    
    public List<Message> getConversation(Long userId1, Long userId2) {
        User user1 = userRepository.findById(userId1)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId1));
        
        User user2 = userRepository.findById(userId2)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId2));
        
        return messageRepository.findBySenderAndReceiverOrderByCreatedAtDesc(user1, user2);
    }
    
    public List<Message> getPropertyMessages(Long propertyId) {
        return messageRepository.findByPropertyIdOrderByCreatedAtDesc(propertyId);
    }
    
    public Message markMessageAsRead(Long messageId) {
        Message message = messageRepository.findById(messageId)
            .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setRead(true);
        return messageRepository.save(message);
    }
    
    public List<Message> getUnreadMessages(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        
        return messageRepository.findByReceiverAndIsReadFalse(user);
    }
    
    public long getUnreadMessageCount(Long userId) {
        return getUnreadMessages(userId).size();
    }
    
    public boolean deleteMessage(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found with id: " + messageId));
        
        if (!message.getSender().getId().equals(userId) && !message.getReceiver().getId().equals(userId)) {
            return false;
        }
        
        messageRepository.delete(message);
        return true;
    }
    
    public Message markAsRead(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found with id: " + messageId));
        message.setRead(true);
        return messageRepository.save(message);
    }
} 