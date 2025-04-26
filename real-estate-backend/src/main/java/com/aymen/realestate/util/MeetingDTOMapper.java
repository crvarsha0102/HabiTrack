package com.aymen.realestate.util;

import com.aymen.realestate.dto.MeetingDTO;
import com.aymen.realestate.model.Listing;
import com.aymen.realestate.model.Meeting;
import com.aymen.realestate.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Utility class for mapping Meeting entities to MeetingDTOs
 * to avoid LazyInitializationException when serializing
 */
public class MeetingDTOMapper {
    private static final Logger logger = LoggerFactory.getLogger(MeetingDTOMapper.class);
    
    /**
     * Convert a Meeting entity to a MeetingDTO
     * Safely handles lazy-loaded relationships
     */
    public static MeetingDTO toDTO(Meeting meeting) {
        if (meeting == null) {
            return null;
        }
        
        MeetingDTO dto = new MeetingDTO();
        
        // Set basic fields
        dto.setId(meeting.getId());
        dto.setTitle(meeting.getTitle());
        dto.setDescription(meeting.getDescription());
        dto.setMeetingTime(meeting.getMeetingTime());
        dto.setDurationMinutes(meeting.getDurationMinutes());
        dto.setLocation(meeting.getLocation());
        dto.setMeetingLink(meeting.getMeetingLink());
        dto.setStatus(meeting.getStatus());
        dto.setCreatedAt(meeting.getCreatedAt());
        dto.setUpdatedAt(meeting.getUpdatedAt());
        
        // Set property ID
        dto.setPropertyId(meeting.getPropertyId());
        
        // Set message ID
        dto.setMessageId(meeting.getMessageId());
        
        // Safely get creator information
        try {
            User creator = meeting.getCreator();
            if (creator != null) {
                dto.setCreatorId(creator.getId());
                dto.setCreatorName(creator.getFullName());
            }
        } catch (Exception e) {
            logger.warn("Error getting creator information for meeting id {}: {}", meeting.getId(), e.getMessage());
        }
        
        // Safely get participant information
        try {
            User participant = meeting.getParticipant();
            if (participant != null) {
                dto.setParticipantId(participant.getId());
                dto.setParticipantName(participant.getFullName());
            }
        } catch (Exception e) {
            logger.warn("Error getting participant information for meeting id {}: {}", meeting.getId(), e.getMessage());
        }
        
        // Safely get property information
        try {
            Listing property = meeting.getProperty();
            if (property != null) {
                dto.setPropertyName(property.getName());
                
                // Set the first image URL if available
                if (property.getImageUrls() != null && !property.getImageUrls().isEmpty()) {
                    dto.setPropertyImageUrl(property.getImageUrls().get(0));
                }
            }
        } catch (Exception e) {
            logger.warn("Error getting property information for meeting id {}: {}", meeting.getId(), e.getMessage());
        }
        
        return dto;
    }
    
    /**
     * Convert a list of Meeting entities to a list of MeetingDTOs
     */
    public static List<MeetingDTO> toDTOList(List<Meeting> meetings) {
        if (meetings == null) {
            return new ArrayList<>();
        }
        
        return meetings.stream()
                .map(MeetingDTOMapper::toDTO)
                .collect(Collectors.toList());
    }
} 