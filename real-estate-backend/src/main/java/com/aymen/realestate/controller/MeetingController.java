package com.aymen.realestate.controller;

import com.aymen.realestate.dto.ApiResponse;
import com.aymen.realestate.dto.MeetingDTO;
import com.aymen.realestate.dto.MeetingRequest;
import com.aymen.realestate.model.Meeting;
import com.aymen.realestate.model.Meeting.MeetingStatus;
import com.aymen.realestate.config.JwtTokenProvider;
import com.aymen.realestate.service.MeetingService;
import com.aymen.realestate.service.UserService;
import com.aymen.realestate.util.MeetingDTOMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meetings")
public class MeetingController {

    private static final Logger logger = LoggerFactory.getLogger(MeetingController.class);

    @Autowired
    private MeetingService meetingService;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    /**
     * Create a new meeting
     */
    @PostMapping
    public ResponseEntity<ApiResponse<MeetingDTO>> createMeeting(
            @RequestBody MeetingRequest meetingRequest,
            @RequestHeader("Authorization") String token) {
        
        try {
            logger.debug("Received create meeting request");
            
            // Validate token and get user ID
            String jwtToken = token.replace("Bearer ", "");
            Long userId = jwtTokenProvider.getUserIdFromJWT(jwtToken);
            
            // Create the meeting
            Meeting meeting = meetingService.createMeeting(meetingRequest, userId);
            
            // Convert to DTO
            MeetingDTO meetingDTO = MeetingDTOMapper.toDTO(meeting);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Meeting created successfully", meetingDTO));
        } catch (Exception e) {
            logger.error("Error creating meeting: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error creating meeting: " + e.getMessage(), null));
        }
    }

    /**
     * Get a meeting by ID
     */
    @GetMapping("/{meetingId}")
    public ResponseEntity<ApiResponse<MeetingDTO>> getMeeting(
            @PathVariable Long meetingId,
            @RequestHeader("Authorization") String token) {
        
        try {
            // Validate token (but don't need user ID for this operation)
            String jwtToken = token.replace("Bearer ", "");
            jwtTokenProvider.validateToken(jwtToken);
            
            // Get the meeting
            Meeting meeting = meetingService.getMeeting(meetingId);
            
            // Convert to DTO
            MeetingDTO meetingDTO = MeetingDTOMapper.toDTO(meeting);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Meeting retrieved successfully", meetingDTO));
        } catch (Exception e) {
            logger.error("Error retrieving meeting: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error retrieving meeting: " + e.getMessage(), null));
        }
    }

    /**
     * Get upcoming meetings for the authenticated user
     */
    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<MeetingDTO>>> getUpcomingMeetings(
            @RequestHeader("Authorization") String token) {
        
        try {
            // Validate token and get user ID
            String jwtToken = token.replace("Bearer ", "");
            Long userId = jwtTokenProvider.getUserIdFromJWT(jwtToken);
            
            // Get upcoming meetings
            List<Meeting> meetings = meetingService.getUpcomingMeetings(userId);
            
            // Convert to DTOs
            List<MeetingDTO> meetingDTOs = MeetingDTOMapper.toDTOList(meetings);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Upcoming meetings retrieved successfully", meetingDTOs));
        } catch (Exception e) {
            logger.error("Error retrieving upcoming meetings: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error retrieving upcoming meetings: " + e.getMessage(), null));
        }
    }

    /**
     * Get past meetings for the authenticated user
     */
    @GetMapping("/past")
    public ResponseEntity<ApiResponse<List<MeetingDTO>>> getPastMeetings(
            @RequestHeader("Authorization") String token) {
        
        try {
            // Validate token and get user ID
            String jwtToken = token.replace("Bearer ", "");
            Long userId = jwtTokenProvider.getUserIdFromJWT(jwtToken);
            
            // Get past meetings
            List<Meeting> meetings = meetingService.getPastMeetings(userId);
            
            // Convert to DTOs
            List<MeetingDTO> meetingDTOs = MeetingDTOMapper.toDTOList(meetings);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Past meetings retrieved successfully", meetingDTOs));
        } catch (Exception e) {
            logger.error("Error retrieving past meetings: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error retrieving past meetings: " + e.getMessage(), null));
        }
    }

    /**
     * Get meetings created by the authenticated user
     */
    @GetMapping("/created")
    public ResponseEntity<ApiResponse<List<MeetingDTO>>> getCreatedMeetings(
            @RequestHeader("Authorization") String token) {
        
        try {
            // Validate token and get user ID
            String jwtToken = token.replace("Bearer ", "");
            Long userId = jwtTokenProvider.getUserIdFromJWT(jwtToken);
            
            // Get created meetings
            List<Meeting> meetings = meetingService.getCreatedMeetings(userId);
            
            // Convert to DTOs
            List<MeetingDTO> meetingDTOs = MeetingDTOMapper.toDTOList(meetings);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Created meetings retrieved successfully", meetingDTOs));
        } catch (Exception e) {
            logger.error("Error retrieving created meetings: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error retrieving created meetings: " + e.getMessage(), null));
        }
    }

    /**
     * Get meetings where the authenticated user is a participant
     */
    @GetMapping("/participating")
    public ResponseEntity<ApiResponse<List<MeetingDTO>>> getParticipatingMeetings(
            @RequestHeader("Authorization") String token) {
        
        try {
            // Validate token and get user ID
            String jwtToken = token.replace("Bearer ", "");
            Long userId = jwtTokenProvider.getUserIdFromJWT(jwtToken);
            
            // Get participating meetings
            List<Meeting> meetings = meetingService.getParticipatingMeetings(userId);
            
            // Convert to DTOs
            List<MeetingDTO> meetingDTOs = MeetingDTOMapper.toDTOList(meetings);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Participating meetings retrieved successfully", meetingDTOs));
        } catch (Exception e) {
            logger.error("Error retrieving participating meetings: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error retrieving participating meetings: " + e.getMessage(), null));
        }
    }

    /**
     * Get meetings related to a specific message
     */
    @GetMapping("/message/{messageId}")
    public ResponseEntity<ApiResponse<List<MeetingDTO>>> getMeetingsByMessageId(
            @PathVariable Long messageId,
            @RequestHeader("Authorization") String token) {
        
        try {
            // Validate token (but don't need user ID for this operation)
            String jwtToken = token.replace("Bearer ", "");
            jwtTokenProvider.validateToken(jwtToken);
            
            // Get meetings for the message
            List<Meeting> meetings = meetingService.getMeetingsByMessageId(messageId);
            
            // Convert to DTOs
            List<MeetingDTO> meetingDTOs = MeetingDTOMapper.toDTOList(meetings);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Meetings for message retrieved successfully", meetingDTOs));
        } catch (Exception e) {
            logger.error("Error retrieving meetings for message: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error retrieving meetings for message: " + e.getMessage(), null));
        }
    }

    /**
     * Accept a meeting invitation
     */
    @PostMapping("/{meetingId}/accept")
    public ResponseEntity<ApiResponse<MeetingDTO>> acceptMeeting(
            @PathVariable Long meetingId,
            @RequestHeader("Authorization") String token) {
        
        try {
            // Validate token and get user ID
            String jwtToken = token.replace("Bearer ", "");
            Long userId = jwtTokenProvider.getUserIdFromJWT(jwtToken);
            
            // Accept the meeting
            Meeting meeting = meetingService.updateMeetingStatus(meetingId, MeetingStatus.ACCEPTED, userId);
            
            // Convert to DTO
            MeetingDTO meetingDTO = MeetingDTOMapper.toDTO(meeting);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Meeting accepted successfully", meetingDTO));
        } catch (Exception e) {
            logger.error("Error accepting meeting: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error accepting meeting: " + e.getMessage(), null));
        }
    }

    /**
     * Decline a meeting invitation
     */
    @PostMapping("/{meetingId}/decline")
    public ResponseEntity<ApiResponse<MeetingDTO>> declineMeeting(
            @PathVariable Long meetingId,
            @RequestHeader("Authorization") String token) {
        
        try {
            // Validate token and get user ID
            String jwtToken = token.replace("Bearer ", "");
            Long userId = jwtTokenProvider.getUserIdFromJWT(jwtToken);
            
            // Decline the meeting
            Meeting meeting = meetingService.updateMeetingStatus(meetingId, MeetingStatus.DECLINED, userId);
            
            // Convert to DTO
            MeetingDTO meetingDTO = MeetingDTOMapper.toDTO(meeting);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Meeting declined successfully", meetingDTO));
        } catch (Exception e) {
            logger.error("Error declining meeting: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error declining meeting: " + e.getMessage(), null));
        }
    }

    /**
     * Cancel a meeting
     */
    @PostMapping("/{meetingId}/cancel")
    public ResponseEntity<ApiResponse<MeetingDTO>> cancelMeeting(
            @PathVariable Long meetingId,
            @RequestHeader("Authorization") String token) {
        
        try {
            // Validate token and get user ID
            String jwtToken = token.replace("Bearer ", "");
            Long userId = jwtTokenProvider.getUserIdFromJWT(jwtToken);
            
            // Cancel the meeting
            Meeting meeting = meetingService.updateMeetingStatus(meetingId, MeetingStatus.CANCELLED, userId);
            
            // Convert to DTO
            MeetingDTO meetingDTO = MeetingDTOMapper.toDTO(meeting);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Meeting cancelled successfully", meetingDTO));
        } catch (Exception e) {
            logger.error("Error cancelling meeting: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error cancelling meeting: " + e.getMessage(), null));
        }
    }

    /**
     * Mark a meeting as completed
     */
    @PostMapping("/{meetingId}/complete")
    public ResponseEntity<ApiResponse<MeetingDTO>> completeMeeting(
            @PathVariable Long meetingId,
            @RequestHeader("Authorization") String token) {
        
        try {
            // Validate token and get user ID
            String jwtToken = token.replace("Bearer ", "");
            Long userId = jwtTokenProvider.getUserIdFromJWT(jwtToken);
            
            // Mark the meeting as completed
            Meeting meeting = meetingService.updateMeetingStatus(meetingId, MeetingStatus.COMPLETED, userId);
            
            // Convert to DTO
            MeetingDTO meetingDTO = MeetingDTOMapper.toDTO(meeting);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Meeting marked as completed successfully", meetingDTO));
        } catch (Exception e) {
            logger.error("Error marking meeting as completed: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error marking meeting as completed: " + e.getMessage(), null));
        }
    }

    /**
     * Update meeting details
     */
    @PutMapping("/{meetingId}")
    public ResponseEntity<ApiResponse<MeetingDTO>> updateMeeting(
            @PathVariable Long meetingId,
            @RequestBody MeetingRequest meetingRequest,
            @RequestHeader("Authorization") String token) {
        
        try {
            // Validate token and get user ID
            String jwtToken = token.replace("Bearer ", "");
            Long userId = jwtTokenProvider.getUserIdFromJWT(jwtToken);
            
            // Update the meeting
            Meeting meeting = meetingService.updateMeeting(meetingId, meetingRequest, userId);
            
            // Convert to DTO
            MeetingDTO meetingDTO = MeetingDTOMapper.toDTO(meeting);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Meeting updated successfully", meetingDTO));
        } catch (Exception e) {
            logger.error("Error updating meeting: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error updating meeting: " + e.getMessage(), null));
        }
    }

    /**
     * Delete a meeting
     */
    @DeleteMapping("/{meetingId}")
    public ResponseEntity<ApiResponse<Void>> deleteMeeting(
            @PathVariable Long meetingId,
            @RequestHeader("Authorization") String token) {
        
        try {
            // Validate token and get user ID
            String jwtToken = token.replace("Bearer ", "");
            Long userId = jwtTokenProvider.getUserIdFromJWT(jwtToken);
            
            // Delete the meeting
            boolean deleted = meetingService.deleteMeeting(meetingId, userId);
            
            if (deleted) {
                return ResponseEntity.ok(new ApiResponse<>(true, "Meeting deleted successfully", null));
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Failed to delete meeting", null));
            }
        } catch (Exception e) {
            logger.error("Error deleting meeting: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error deleting meeting: " + e.getMessage(), null));
        }
    }

    /**
     * Mark the authenticated user as notified for a meeting
     */
    @PostMapping("/{meetingId}/mark-notified")
    public ResponseEntity<ApiResponse<MeetingDTO>> markNotified(
            @PathVariable Long meetingId,
            @RequestHeader("Authorization") String token) {
        
        try {
            // Validate token and get user ID
            String jwtToken = token.replace("Bearer ", "");
            Long userId = jwtTokenProvider.getUserIdFromJWT(jwtToken);
            
            // Mark the user as notified
            Meeting meeting = meetingService.markUserNotified(meetingId, userId);
            
            // Convert to DTO
            MeetingDTO meetingDTO = MeetingDTOMapper.toDTO(meeting);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "User marked as notified successfully", meetingDTO));
        } catch (Exception e) {
            logger.error("Error marking user as notified: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error marking user as notified: " + e.getMessage(), null));
        }
    }
} 