package com.aymen.realestate.service;

import com.aymen.realestate.dto.MeetingRequest;
import com.aymen.realestate.exception.UserNotFoundException;
import com.aymen.realestate.model.Listing;
import com.aymen.realestate.model.Meeting;
import com.aymen.realestate.model.Meeting.MeetingStatus;
import com.aymen.realestate.model.Message;
import com.aymen.realestate.model.User;
import com.aymen.realestate.repository.ListingRepository;
import com.aymen.realestate.repository.MeetingRepository;
import com.aymen.realestate.repository.MessageRepository;
import com.aymen.realestate.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class MeetingService {
    
    private static final Logger logger = LoggerFactory.getLogger(MeetingService.class);
    
    @Autowired
    private MeetingRepository meetingRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private MessageRepository messageRepository;
    
    @Autowired
    private ListingRepository listingRepository;
    
    @Autowired
    private MessageService messageService;
    
    /**
     * Create a new meeting request 
     * This method is used when a user wants to schedule a meeting with another user
     */
    public Meeting createMeeting(MeetingRequest request, Long creatorId) {
        try {
            logger.debug("Creating meeting from request: creatorId={}, participantId={}, messageId={}, title={}, propertyId={}", 
                creatorId, 
                request.getParticipantId(),
                request.getMessageId(),
                request.getTitle(),
                request.getPropertyId());
            
            // Validate required fields
            if (request.getParticipantId() == null) {
                throw new IllegalArgumentException("Participant ID is required");
            }
            
            if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
                throw new IllegalArgumentException("Meeting title is required");
            }
            
            if (request.getMeetingTime() == null) {
                throw new IllegalArgumentException("Meeting time is required");
            }
            
            if (request.getMeetingTime().isBefore(Instant.now())) {
                throw new IllegalArgumentException("Meeting time must be in the future");
            }
            
            // Validate propertyId (required)
            if (request.getPropertyId() == null) {
                throw new IllegalArgumentException("Property ID is required");
            }
            
            // Get the creator user
            User creator = userRepository.findById(creatorId)
                    .orElseThrow(() -> new UserNotFoundException("Creator not found with id: " + creatorId));
            
            // Get the participant user
            User participant = userRepository.findById(request.getParticipantId())
                    .orElseThrow(() -> new UserNotFoundException("Participant not found with id: " + request.getParticipantId()));
            
            // Create the meeting entity
            Meeting meeting = new Meeting();
            meeting.setCreator(creator);
            meeting.setParticipant(participant);
            meeting.setTitle(request.getTitle());
            meeting.setDescription(request.getDescription());
            meeting.setMeetingTime(request.getMeetingTime());
            
            // Set duration if provided, otherwise use default (30 minutes)
            if (request.getDurationMinutes() != null) {
                meeting.setDurationMinutes(request.getDurationMinutes());
            }
            
            meeting.setLocation(request.getLocation());
            meeting.setMeetingLink(request.getMeetingLink());
            
            // Set property if provided
            if (request.getPropertyId() != null) {
                logger.debug("Setting property ID to: {}", request.getPropertyId());
                meeting.setPropertyId(request.getPropertyId());
                
                // Try to set the property object
                try {
                    Listing property = listingRepository.findById(request.getPropertyId()).orElse(null);
                    if (property != null) {
                        logger.debug("Found property with ID {} and name {}", property.getId(), property.getName());
                        meeting.setProperty(property);
                    } else {
                        logger.warn("Property with ID {} not found", request.getPropertyId());
                    }
                } catch (Exception e) {
                    logger.warn("Error finding property with id: " + request.getPropertyId(), e);
                }
            } else {
                logger.warn("No property ID provided in meeting request");
            }
            
            // Set message if provided
            if (request.getMessageId() != null) {
                meeting.setMessageId(request.getMessageId());
                
                // Try to set the message object
                try {
                    Message message = messageRepository.findById(request.getMessageId()).orElse(null);
                    if (message != null) {
                        meeting.setMessage(message);
                        // If no property ID was provided but the message has one, use it
                        if (meeting.getPropertyId() == null && message.getPropertyId() != null) {
                            logger.debug("Using property ID {} from message", message.getPropertyId());
                            meeting.setPropertyId(message.getPropertyId());
                        }
                    }
                } catch (Exception e) {
                    logger.warn("Error finding message with id: " + request.getMessageId(), e);
                }
            }
            
            // Final validation before saving - ensure property ID is set
            if (meeting.getPropertyId() == null) {
                throw new IllegalArgumentException("Property ID must not be null");
            }
            
            try {
                // Save the meeting
                logger.debug("Saving meeting with propertyId: {}", meeting.getPropertyId());
                Meeting savedMeeting = meetingRepository.save(meeting);
                
                // Send a message to the participant about the meeting
                String meetingMessage = String.format(
                    "I'd like to schedule a meeting: \"%s\" on %s. Please accept or decline this invitation.",
                    meeting.getTitle(),
                    meeting.getMeetingTime().toString()
                );
                
                messageService.sendMessage(
                    creator.getId(),
                    participant.getId(),
                    meeting.getPropertyId(),
                    meetingMessage
                );
                
                return savedMeeting;
            } catch (Exception e) {
                logger.error("Database error saving meeting: {}", e.getMessage(), e);
                throw e;
            }
        } catch (Exception e) {
            logger.error("Error creating meeting", e);
            throw e;
        }
    }
    
    /**
     * Get all meetings where the user is either the creator or participant
     */
    public List<Meeting> getUserMeetings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        
        Instant now = Instant.now();
        return meetingRepository.findUpcomingMeetingsForUser(user, now);
    }
    
    /**
     * Get meetings created by a user
     */
    public List<Meeting> getCreatedMeetings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        
        return meetingRepository.findByCreatorOrderByMeetingTimeDesc(user);
    }
    
    /**
     * Get meetings where the user is a participant
     */
    public List<Meeting> getParticipatingMeetings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        
        return meetingRepository.findByParticipantOrderByMeetingTimeDesc(user);
    }
    
    /**
     * Get upcoming meetings for a user
     */
    public List<Meeting> getUpcomingMeetings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        
        Instant now = Instant.now();
        return meetingRepository.findUpcomingMeetingsForUser(user, now);
    }
    
    /**
     * Get past meetings for a user
     */
    public List<Meeting> getPastMeetings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        
        Instant now = Instant.now();
        return meetingRepository.findPastMeetingsForUser(user, now);
    }
    
    /**
     * Get meetings with a specific status for a user
     */
    public List<Meeting> getMeetingsByStatus(Long userId, MeetingStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        
        return meetingRepository.findMeetingsByStatusForUser(user, status);
    }
    
    /**
     * Get meetings related to a specific message thread
     */
    public List<Meeting> getMeetingsByMessageId(Long messageId) {
        return meetingRepository.findByMessageIdOrderByMeetingTimeDesc(messageId);
    }
    
    /**
     * Get meetings related to a specific property
     */
    public List<Meeting> getMeetingsByPropertyId(Long propertyId) {
        return meetingRepository.findByPropertyIdOrderByMeetingTimeDesc(propertyId);
    }
    
    /**
     * Update meeting status (accept, decline, cancel)
     */
    public Meeting updateMeetingStatus(Long meetingId, MeetingStatus status, Long userId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new IllegalArgumentException("Meeting not found with id: " + meetingId));
        
        // Verify the user is either the creator or participant
        if (!meeting.getCreator().getId().equals(userId) && !meeting.getParticipant().getId().equals(userId)) {
            throw new IllegalArgumentException("User does not have permission to update this meeting");
        }
        
        // If the meeting is being accepted/declined, only the participant can do that
        if ((status == MeetingStatus.ACCEPTED || status == MeetingStatus.DECLINED) 
                && !meeting.getParticipant().getId().equals(userId)) {
            throw new IllegalArgumentException("Only the meeting participant can accept or decline the meeting");
        }
        
        // If the meeting is being cancelled, only the creator can do that
        if (status == MeetingStatus.CANCELLED && !meeting.getCreator().getId().equals(userId)) {
            throw new IllegalArgumentException("Only the meeting creator can cancel the meeting");
        }
        
        // Update the status
        meeting.setStatus(status);
        
        // Reset notification flags when status changes
        meeting.setCreatorNotified(false);
        meeting.setParticipantNotified(false);
        
        // Save the meeting
        Meeting updatedMeeting = meetingRepository.save(meeting);
        
        // Send a status update message
        try {
            User sender = userRepository.findById(userId).orElse(null);
            User recipient;
            
            if (sender != null) {
                if (sender.getId().equals(meeting.getCreator().getId())) {
                    recipient = meeting.getParticipant();
                } else {
                    recipient = meeting.getCreator();
                }
                
                String statusMessage;
                
                switch (status) {
                    case ACCEPTED:
                        statusMessage = String.format("I have accepted the meeting \"%s\" scheduled for %s.", 
                            meeting.getTitle(), meeting.getMeetingTime().toString());
                        break;
                    case DECLINED:
                        statusMessage = String.format("I have declined the meeting \"%s\" scheduled for %s.", 
                            meeting.getTitle(), meeting.getMeetingTime().toString());
                        break;
                    case CANCELLED:
                        statusMessage = String.format("I have cancelled the meeting \"%s\" scheduled for %s.", 
                            meeting.getTitle(), meeting.getMeetingTime().toString());
                        break;
                    case COMPLETED:
                        statusMessage = String.format("I have marked the meeting \"%s\" as completed.", 
                            meeting.getTitle());
                        break;
                    default:
                        statusMessage = String.format("The status of meeting \"%s\" has been updated to %s.", 
                            meeting.getTitle(), status.name());
                }
                
                messageService.sendMessage(
                    sender.getId(),
                    recipient.getId(),
                    meeting.getPropertyId(),
                    statusMessage
                );
            }
        } catch (Exception e) {
            logger.warn("Failed to send meeting status update message: {}", e.getMessage());
        }
        
        return updatedMeeting;
    }
    
    /**
     * Update meeting details (title, description, time, etc.)
     */
    public Meeting updateMeeting(Long meetingId, MeetingRequest request, Long userId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new IllegalArgumentException("Meeting not found with id: " + meetingId));
        
        // Only the creator can update meeting details
        if (!meeting.getCreator().getId().equals(userId)) {
            throw new IllegalArgumentException("Only the meeting creator can update meeting details");
        }
        
        // Update fields if provided
        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            meeting.setTitle(request.getTitle());
        }
        
        if (request.getDescription() != null) {
            meeting.setDescription(request.getDescription());
        }
        
        if (request.getMeetingTime() != null) {
            meeting.setMeetingTime(request.getMeetingTime());
        }
        
        if (request.getDurationMinutes() != null) {
            meeting.setDurationMinutes(request.getDurationMinutes());
        }
        
        if (request.getLocation() != null) {
            meeting.setLocation(request.getLocation());
        }
        
        if (request.getMeetingLink() != null) {
            meeting.setMeetingLink(request.getMeetingLink());
        }
        
        // Reset notification flags when details change
        meeting.setCreatorNotified(false);
        meeting.setParticipantNotified(false);
        
        // Save and return the updated meeting
        Meeting updatedMeeting = meetingRepository.save(meeting);
        
        // Send a notification about the meeting update
        try {
            User sender = userRepository.findById(userId).orElse(null);
            
            if (sender != null) {
                String updateMessage = String.format("I have updated the details of our meeting \"%s\" scheduled for %s.", 
                    updatedMeeting.getTitle(), updatedMeeting.getMeetingTime().toString());
                
                messageService.sendMessage(
                    sender.getId(),
                    updatedMeeting.getParticipant().getId(),
                    updatedMeeting.getPropertyId(),
                    updateMessage
                );
            }
        } catch (Exception e) {
            logger.warn("Failed to send meeting update notification: {}", e.getMessage());
        }
        
        return updatedMeeting;
    }
    
    /**
     * Delete a meeting
     */
    public boolean deleteMeeting(Long meetingId, Long userId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new IllegalArgumentException("Meeting not found with id: " + meetingId));
        
        // Only the creator can delete a meeting
        if (!meeting.getCreator().getId().equals(userId)) {
            throw new IllegalArgumentException("Only the meeting creator can delete a meeting");
        }
        
        try {
            // Send a cancellation message before deleting
            User sender = userRepository.findById(userId).orElse(null);
            
            if (sender != null) {
                String cancelMessage = String.format("I have deleted our meeting \"%s\" that was scheduled for %s.", 
                    meeting.getTitle(), meeting.getMeetingTime().toString());
                
                messageService.sendMessage(
                    sender.getId(),
                    meeting.getParticipant().getId(),
                    meeting.getPropertyId(),
                    cancelMessage
                );
            }
            
            // Delete the meeting
            meetingRepository.delete(meeting);
            return true;
        } catch (Exception e) {
            logger.error("Error deleting meeting: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * Get a single meeting by ID
     */
    public Meeting getMeeting(Long meetingId) {
        return meetingRepository.findById(meetingId)
                .orElseThrow(() -> new IllegalArgumentException("Meeting not found with id: " + meetingId));
    }
    
    /**
     * Mark a user as notified for a meeting
     */
    public Meeting markUserNotified(Long meetingId, Long userId) {
        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new IllegalArgumentException("Meeting not found with id: " + meetingId));
        
        // Check if the user is the creator or participant
        if (meeting.getCreator().getId().equals(userId)) {
            meeting.setCreatorNotified(true);
        } else if (meeting.getParticipant().getId().equals(userId)) {
            meeting.setParticipantNotified(true);
        } else {
            throw new IllegalArgumentException("User is not associated with this meeting");
        }
        
        return meetingRepository.save(meeting);
    }
    
    /**
     * Scheduled task to check for meetings that need notifications
     * Runs every 15 minutes
     */
    @Scheduled(cron = "0 */15 * * * *")
    public void sendMeetingNotifications() {
        logger.info("Running scheduled meeting notification check");
        
        Instant now = Instant.now();
        Instant cutoff = now.plus(1, ChronoUnit.HOURS); // Notify for meetings within the next hour
        
        List<Meeting> meetingsNeedingNotification = meetingRepository.findMeetingsNeedingNotification(now, cutoff);
        
        for (Meeting meeting : meetingsNeedingNotification) {
            // Skip meetings that are not accepted
            if (meeting.getStatus() != MeetingStatus.ACCEPTED) {
                continue;
            }
            
            // Notify creator if needed
            if (!meeting.isCreatorNotified()) {
                try {
                    String notificationMessage = String.format(
                        "REMINDER: Your meeting \"%s\" with %s is scheduled in less than 1 hour at %s.", 
                        meeting.getTitle(),
                        meeting.getParticipant().getFullName(),
                        meeting.getMeetingTime().toString()
                    );
                    
                    messageService.sendMessage(
                        null, // System message
                        meeting.getCreator().getId(),
                        meeting.getPropertyId(),
                        notificationMessage
                    );
                    
                    meeting.setCreatorNotified(true);
                    logger.info("Sent meeting reminder to creator for meeting ID: {}", meeting.getId());
                } catch (Exception e) {
                    logger.error("Failed to send meeting notification to creator: {}", e.getMessage());
                }
            }
            
            // Notify participant if needed
            if (!meeting.isParticipantNotified()) {
                try {
                    String notificationMessage = String.format(
                        "REMINDER: Your meeting \"%s\" with %s is scheduled in less than 1 hour at %s.", 
                        meeting.getTitle(),
                        meeting.getCreator().getFullName(),
                        meeting.getMeetingTime().toString()
                    );
                    
                    messageService.sendMessage(
                        null, // System message
                        meeting.getParticipant().getId(),
                        meeting.getPropertyId(),
                        notificationMessage
                    );
                    
                    meeting.setParticipantNotified(true);
                    logger.info("Sent meeting reminder to participant for meeting ID: {}", meeting.getId());
                } catch (Exception e) {
                    logger.error("Failed to send meeting notification to participant: {}", e.getMessage());
                }
            }
            
            // Save notification status updates
            if (meeting.isCreatorNotified() || meeting.isParticipantNotified()) {
                meetingRepository.save(meeting);
            }
        }
    }
} 