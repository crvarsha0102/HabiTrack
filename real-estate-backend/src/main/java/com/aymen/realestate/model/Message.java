package com.aymen.realestate.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "messages")
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(name = "sender_name")
    private String senderName;

    @Column(name = "sender_email")
    private String senderEmail;

    @Column(name = "sender_phone")
    private String senderPhone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @Column(name = "receiver_id", insertable = false, updatable = false)
    private Long recipientId;

    @Column(name = "property_id")
    private Long propertyId;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "property_id", insertable = false, updatable = false)
    private Listing property;

    @Column(name = "subject")
    private String subject;

    /**
     * Main content field - used for backward compatibility.
     * This field will be kept in sync with messageText.
     */
    @Column(name = "message_text", nullable = false, length = 2000, insertable = false, updatable = false)
    private String content;

    /**
     * Actual message content that maps to the database column.
     * This field will be kept in sync with content.
     */
    @Column(name = "message_text", nullable = false, length = 2000, insertable = true, updatable = true)
    private String messageText;

    private void syncContentFields() {
        if (content != null && !content.equals(messageText)) {
            messageText = content;
        } else if (messageText != null && !messageText.equals(content)) {
            content = messageText;
        }
        
        if (receiver != null) {
            recipientId = receiver.getId();
        }
    }

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
        syncContentFields();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
        syncContentFields();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getSender() {
        return sender;
    }

    public void setSender(User sender) {
        this.sender = sender;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getSenderEmail() {
        return senderEmail;
    }

    public void setSenderEmail(String senderEmail) {
        this.senderEmail = senderEmail;
    }

    public String getSenderPhone() {
        return senderPhone;
    }

    public void setSenderPhone(String senderPhone) {
        this.senderPhone = senderPhone;
    }

    public User getReceiver() {
        return receiver;
    }

    public void setReceiver(User receiver) {
        this.receiver = receiver;
        if (receiver != null) {
            this.recipientId = receiver.getId();
        }
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

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
        this.messageText = content;
    }

    public String getMessageText() {
        return messageText;
    }

    public void setMessageText(String messageText) {
        this.messageText = messageText;
        this.content = messageText;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
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

    // Additional methods for the controller
    public Long getRecipientId() {
        return receiver != null ? receiver.getId() : null;
    }

    public Long getSenderId() {
        return sender != null ? sender.getId() : null;
    }
} 