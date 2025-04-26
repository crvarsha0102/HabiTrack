package com.aymen.realestate.controller;

import com.aymen.realestate.config.JwtTokenProvider;
import com.aymen.realestate.dto.ApiResponse;
import com.aymen.realestate.dto.MessageDTO;
import com.aymen.realestate.dto.MessageRequest;
import com.aymen.realestate.model.Message;
import com.aymen.realestate.model.User;
import com.aymen.realestate.service.MessageService;
import com.aymen.realestate.service.UserService;
import com.aymen.realestate.util.MessageDTOMapper;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private static final Logger logger = LoggerFactory.getLogger(MessageController.class);

    @Autowired
    private MessageService messageService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    /**
     * Send a contact message to a property owner
     * This endpoint allows anonymous users (no authentication required)
     */
    @PostMapping("/contact")
    public ResponseEntity<ApiResponse<MessageDTO>> sendContactMessage(@RequestBody MessageRequest messageRequest) {
        try {
            // Log the full request for debugging
            logger.debug("Received contact message request: {}", messageRequest);
            
            // Validate request
            if (messageRequest.getRecipientId() == null) {
                logger.warn("Missing recipient ID in message request");
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Recipient ID is required", null));
            }
            
            if (messageRequest.getMessage() == null || messageRequest.getMessage().trim().isEmpty()) {
                logger.warn("Missing message content in request");
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Message content is required", null));
            }
            
            if (messageRequest.getName() == null || messageRequest.getName().trim().isEmpty()) {
                logger.warn("Missing sender name in request");
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Your name is required", null));
            }
            
            if (messageRequest.getEmail() == null || messageRequest.getEmail().trim().isEmpty()) {
                logger.warn("Missing sender email in request");
                return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "Your email is required", null));
            }
            
            // Log the request details for debugging
            logger.info("Sending message: recipient={}, property={}, messageLength={}, subject='{}'",
                messageRequest.getRecipientId(),
                messageRequest.getPropertyId(),
                messageRequest.getMessage() != null ? messageRequest.getMessage().length() : 0,
                messageRequest.getSubject());
            
            try {
                // Create and save message
                Message message = messageService.createMessage(messageRequest);
                
                // Convert to DTO to avoid LazyInitializationException
                MessageDTO messageDTO = MessageDTOMapper.toDTO(message);
                
                return ResponseEntity.ok(new ApiResponse<>(true, "Message sent successfully", messageDTO));
            } catch (Exception e) {
                logger.error("Error creating message: {}", e.getMessage(), e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Error processing message: " + e.getMessage(), null));
            }
        } catch (Exception e) {
            logger.error("Error sending contact message: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error sending message: " + e.getMessage(), null));
        }
    }

    /**
     * Get all messages for the authenticated user
     */
    @GetMapping("/inbox")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getInboxMessages(
            @CookieValue(name = "access_token", required = false) String accessTokenCookie,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Get token from either cookie or Authorization header
            String token = extractToken(accessTokenCookie, authHeader);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(false, "Authentication token is required", null));
            }
            
            // Validate token and get user ID
            Jws<Claims> claimsJws = jwtTokenProvider.validateToken(token);
            Long userId = getUserIdFromClaims(claimsJws);
            
            // Get all messages where user is recipient
            List<Message> messages = messageService.getMessagesByRecipientId(userId);
            
            // Convert to DTOs to avoid LazyInitializationException
            List<MessageDTO> messageDTOs = MessageDTOMapper.toDTOList(messages);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Inbox messages retrieved successfully", messageDTOs));
        } catch (JwtException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ApiResponse<>(false, "Token is not valid", null));
        } catch (Exception e) {
            logger.error("Error getting inbox messages: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error retrieving messages: " + e.getMessage(), null));
        }
    }

    /**
     * Get all sent messages for the authenticated user
     */
    @GetMapping("/sent")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getSentMessages(
            @CookieValue(name = "access_token", required = false) String accessTokenCookie,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Get token from either cookie or Authorization header
            String token = extractToken(accessTokenCookie, authHeader);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(false, "Authentication token is required", null));
            }
            
            // Validate token and get user ID
            Jws<Claims> claimsJws = jwtTokenProvider.validateToken(token);
            Long userId = getUserIdFromClaims(claimsJws);
            
            // Get all messages where user is sender
            List<Message> messages = messageService.getMessagesBySenderId(userId);
            
            // Convert to DTOs to avoid LazyInitializationException
            List<MessageDTO> messageDTOs = MessageDTOMapper.toDTOList(messages);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Sent messages retrieved successfully", messageDTOs));
        } catch (JwtException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ApiResponse<>(false, "Token is not valid", null));
        } catch (Exception e) {
            logger.error("Error getting sent messages: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error retrieving messages: " + e.getMessage(), null));
        }
    }

    /**
     * Get count of unread messages for authenticated user
     */
    @GetMapping("/unread/count")
    public ResponseEntity<ApiResponse<Long>> getUnreadMessageCount(
            @CookieValue(name = "access_token", required = false) String accessTokenCookie,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Get token from either cookie or Authorization header
            String token = extractToken(accessTokenCookie, authHeader);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(false, "Authentication token is required", null));
            }
            
            // Validate token and get user ID
            Jws<Claims> claimsJws = jwtTokenProvider.validateToken(token);
            Long userId = getUserIdFromClaims(claimsJws);
            
            // Get count of unread messages
            long unreadCount = messageService.getUnreadMessageCount(userId);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Unread message count retrieved", unreadCount));
        } catch (JwtException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ApiResponse<>(false, "Token is not valid", null));
        } catch (Exception e) {
            logger.error("Error getting unread message count: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error retrieving unread count: " + e.getMessage(), null));
        }
    }

    /**
     * Mark a message as read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<MessageDTO>> markMessageAsRead(
            @PathVariable Long id,
            @CookieValue(name = "access_token", required = false) String accessTokenCookie,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Get token from either cookie or Authorization header
            String token = extractToken(accessTokenCookie, authHeader);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(false, "Authentication token is required", null));
            }
            
            // Validate token and get user ID
            Jws<Claims> claimsJws = jwtTokenProvider.validateToken(token);
            Long userId = getUserIdFromClaims(claimsJws);
            
            Message message = messageService.markMessageAsRead(id);
            
            if (message == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Check if user is the recipient
            if (!message.getRecipientId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, "You are not authorized to mark this message as read", null));
            }
            
            // Convert to DTO to avoid LazyInitializationException
            MessageDTO messageDTO = MessageDTOMapper.toDTO(message);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Message marked as read", messageDTO));
        } catch (JwtException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ApiResponse<>(false, "Token is not valid", null));
        } catch (Exception e) {
            logger.error("Error marking message as read: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error marking message as read: " + e.getMessage(), null));
        }
    }

    /**
     * Delete a message
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(
            @PathVariable Long id,
            @CookieValue(name = "access_token", required = false) String accessTokenCookie,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Get token from either cookie or Authorization header
            String token = extractToken(accessTokenCookie, authHeader);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(false, "Authentication token is required", null));
            }
            
            // Validate token and get user ID
            Jws<Claims> claimsJws = jwtTokenProvider.validateToken(token);
            Long userId = getUserIdFromClaims(claimsJws);
            
            boolean deleted = messageService.deleteMessage(id, userId);
            
            if (!deleted) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, "You are not authorized to delete this message or message not found", null));
            }
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Message deleted successfully", null));
        } catch (JwtException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ApiResponse<>(false, "Token is not valid", null));
        } catch (Exception e) {
            logger.error("Error deleting message: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error deleting message: " + e.getMessage(), null));
        }
    }
    
    /**
     * Helper method to extract token from cookie or Authorization header
     */
    private String extractToken(String accessTokenCookie, String authHeader) {
        // First try the cookie
        if (accessTokenCookie != null && !accessTokenCookie.isEmpty()) {
            return accessTokenCookie;
        }
        
        // Then try the Authorization header
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        
        return null;
    }
    
    /**
     * Helper method to extract user ID from JWT claims
     */
    private Long getUserIdFromClaims(Jws<Claims> claimsJws) {
        String subject = claimsJws.getBody().getSubject();
        
        try {
            // If the subject is a user ID (numeric)
            return Long.parseLong(subject);
        } catch (NumberFormatException e) {
            // If the subject is an email address, we need to lookup user by email
            User user = userService.findByEmail(subject);
            return user != null ? user.getId() : null;
        }
    }

    @GetMapping("/sent/{userId}")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getSentMessages(@PathVariable Long userId) {
        try {
            logger.debug("Getting sent messages for user ID: {}", userId);
            
            // Fetch messages from the service
            List<Message> messages = messageService.getSentMessages(userId);
            
            // Convert to DTOs to avoid LazyInitializationException
            List<MessageDTO> messageDTOs = MessageDTOMapper.toDTOList(messages);
            
            logger.debug("Retrieved {} sent messages for user {}", messageDTOs.size(), userId);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Sent messages retrieved successfully", messageDTOs));
        } catch (Exception e) {
            logger.error("Error retrieving sent messages for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error retrieving messages: " + e.getMessage(), null));
        }
    }

    @GetMapping("/received/{userId}")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getReceivedMessages(@PathVariable Long userId) {
        try {
            logger.debug("Getting received messages for user ID: {}", userId);
            
            // Fetch messages from the service
            List<Message> messages = messageService.getReceivedMessages(userId);
            
            // Convert to DTOs to avoid LazyInitializationException
            List<MessageDTO> messageDTOs = MessageDTOMapper.toDTOList(messages);
            
            logger.debug("Retrieved {} received messages for user {}", messageDTOs.size(), userId);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Received messages retrieved successfully", messageDTOs));
        } catch (Exception e) {
            logger.error("Error retrieving received messages for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error retrieving messages: " + e.getMessage(), null));
        }
    }

    @GetMapping("/conversation/{userId1}/{userId2}")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getConversation(
            @PathVariable Long userId1,
            @PathVariable Long userId2) {
        try {
            List<Message> messages = messageService.getConversation(userId1, userId2);
            
            // Convert to DTOs to avoid LazyInitializationException
            List<MessageDTO> messageDTOs = MessageDTOMapper.toDTOList(messages);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Conversation retrieved successfully", messageDTOs));
        } catch (Exception e) {
            logger.error("Error retrieving conversation between users {} and {}: {}", userId1, userId2, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error retrieving conversation: " + e.getMessage(), null));
        }
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getPropertyMessages(@PathVariable Long propertyId) {
        try {
            List<Message> messages = messageService.getPropertyMessages(propertyId);
            
            // Convert to DTOs to avoid LazyInitializationException
            List<MessageDTO> messageDTOs = MessageDTOMapper.toDTOList(messages);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Property messages retrieved successfully", messageDTOs));
        } catch (Exception e) {
            logger.error("Error retrieving messages for property {}: {}", propertyId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error retrieving property messages: " + e.getMessage(), null));
        }
    }

    @PutMapping("/read/{messageId}")
    public ResponseEntity<ApiResponse<MessageDTO>> markAsRead(@PathVariable Long messageId) {
        try {
            Message message = messageService.markAsRead(messageId);
            
            // Convert to DTO to avoid LazyInitializationException
            MessageDTO messageDTO = MessageDTOMapper.toDTO(message);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Message marked as read", messageDTO));
        } catch (Exception e) {
            logger.error("Error marking message as read: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error marking message as read: " + e.getMessage(), null));
        }
    }

    @GetMapping("/unread/{userId}")
    public ResponseEntity<ApiResponse<List<MessageDTO>>> getUnreadMessages(@PathVariable Long userId) {
        try {
            logger.debug("Getting unread messages for user ID: {}", userId);
            
            // Fetch messages from the service
            List<Message> messages = messageService.getUnreadMessages(userId);
            
            // Convert to DTOs to avoid LazyInitializationException
            List<MessageDTO> messageDTOs = MessageDTOMapper.toDTOList(messages);
            
            logger.debug("Retrieved {} unread messages for user {}", messageDTOs.size(), userId);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Unread messages retrieved successfully", messageDTOs));
        } catch (Exception e) {
            logger.error("Error retrieving unread messages for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error retrieving messages: " + e.getMessage(), null));
        }
    }

    /**
     * Send a direct message from one user to another
     * This endpoint requires authentication
     */
    @PostMapping("/send")
    public ResponseEntity<ApiResponse<MessageDTO>> sendDirectMessage(
            @RequestBody MessageRequest messageRequest,
            @CookieValue(name = "access_token", required = false) String accessTokenCookie,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Get token from either cookie or Authorization header
            String token = extractToken(accessTokenCookie, authHeader);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(false, "Authentication token is required", null));
            }
            
            // Validate token and get user ID
            Jws<Claims> claimsJws = jwtTokenProvider.validateToken(token);
            Long userId = getUserIdFromClaims(claimsJws);
            
            // Verify the sender is the authenticated user
            if (!userId.equals(messageRequest.getSenderId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ApiResponse<>(false, "You can only send messages as yourself", null));
            }
            
            // Validate request
            if (messageRequest.getRecipientId() == null) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "Recipient ID is required", null));
            }
            
            if (messageRequest.getPropertyId() == null) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "Property ID is required", null));
            }
            
            if (messageRequest.getMessage() == null || messageRequest.getMessage().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(false, "Message content is required", null));
            }
            
            // Log the request details for debugging
            logger.info("Sending message: recipient={}, property={}, messageLength={}, subject='{}'",
                messageRequest.getRecipientId(),
                messageRequest.getPropertyId(),
                messageRequest.getMessage() != null ? messageRequest.getMessage().length() : 0,
                messageRequest.getSubject());
            
            // Create and save message
            Message message = messageService.createMessage(messageRequest);
            
            // Convert to DTO to avoid LazyInitializationException
            MessageDTO messageDTO = MessageDTOMapper.toDTO(message);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Message sent successfully", messageDTO));
        } catch (JwtException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ApiResponse<>(false, "Token is not valid", null));
        } catch (Exception e) {
            logger.error("Error sending direct message: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error sending message: " + e.getMessage(), null));
        }
    }
} 