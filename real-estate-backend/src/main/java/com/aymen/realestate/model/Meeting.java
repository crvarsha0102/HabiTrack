package com.aymen.realestate.model;

import jakarta.persistence.*;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Entity
@Table(name = "meetings")
public class Meeting {
    private static final Logger logger = LoggerFactory.getLogger(Meeting.class);
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_id", nullable = false)
    private User participant;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "meeting_time", nullable = false)
    private Instant meetingTime;

    @Column(name = "duration_minutes")
    private Integer durationMinutes = 30; // Default to 30 minutes

    @Column(name = "location")
    private String location;

    @Column(name = "meeting_link")
    private String meetingLink;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "property_id", insertable = false, updatable = false)
    private Listing property;

    @Column(name = "message_id")
    private Long messageId;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "message_id", insertable = false, updatable = false)
    private Message message;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private MeetingStatus status = MeetingStatus.PENDING;

    @Column(name = "creator_notified", nullable = false)
    private boolean creatorNotified = false;

    @Column(name = "participant_notified", nullable = false)
    private boolean participantNotified = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
        
        // Ensure propertyId is not null
        if (propertyId == null) {
            logger.error("Property ID cannot be null when creating a meeting");
            throw new IllegalStateException("Property ID cannot be null");
        }
        
        // Default status if not set
        if (status == null) {
            status = MeetingStatus.PENDING;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
        
        // Ensure propertyId is not null
        if (propertyId == null) {
            logger.error("Property ID cannot be null when updating a meeting");
            throw new IllegalStateException("Property ID cannot be null");
        }
    }
    
    // Enum for meeting status
    public enum MeetingStatus {
        PENDING, ACCEPTED, DECLINED, CANCELLED, COMPLETED
    }
    
    // Getters and setters
    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getCreator() {
        return creator;
    }

    public void setCreator(User creator) {
        this.creator = creator;
    }

    public User getParticipant() {
        return participant;
    }

    public void setParticipant(User participant) {
        this.participant = participant;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Instant getMeetingTime() {
        return meetingTime;
    }

    public void setMeetingTime(Instant meetingTime) {
        this.meetingTime = meetingTime;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getMeetingLink() {
        return meetingLink;
    }

    public void setMeetingLink(String meetingLink) {
        this.meetingLink = meetingLink;
    }

    public Long getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }

    public Listing getProperty() {
        return property;
    }

    public void setProperty(Listing property) {
        this.property = property;
        if (property != null) {
            this.propertyId = property.getId();
        }
    }

    public Long getMessageId() {
        return messageId;
    }

    public void setMessageId(Long messageId) {
        this.messageId = messageId;
    }

    public Message getMessage() {
        return message;
    }

    public void setMessage(Message message) {
        this.message = message;
        if (message != null) {
            this.messageId = message.getId();
        }
    }

    public MeetingStatus getStatus() {
        return status;
    }

    public void setStatus(MeetingStatus status) {
        this.status = status;
    }

    public boolean isCreatorNotified() {
        return creatorNotified;
    }

    public void setCreatorNotified(boolean creatorNotified) {
        this.creatorNotified = creatorNotified;
    }

    public boolean isParticipantNotified() {
        return participantNotified;
    }

    public void setParticipantNotified(boolean participantNotified) {
        this.participantNotified = participantNotified;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
} 