package com.aymen.realestate.repository;

import com.aymen.realestate.model.Meeting;
import com.aymen.realestate.model.Meeting.MeetingStatus;
import com.aymen.realestate.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    // Find meetings created by a user
    List<Meeting> findByCreatorOrderByMeetingTimeDesc(User creator);

    // Find meetings where the user is a participant
    List<Meeting> findByParticipantOrderByMeetingTimeDesc(User participant);

    // Find meetings related to a conversation (message)
    List<Meeting> findByMessageIdOrderByMeetingTimeDesc(Long messageId);

    // Find meetings related to a property
    List<Meeting> findByPropertyIdOrderByMeetingTimeDesc(Long propertyId);

    // Find upcoming meetings for a user (either as creator or participant)
    @Query("SELECT m FROM Meeting m WHERE (m.creator = ?1 OR m.participant = ?1) AND m.meetingTime > ?2 ORDER BY m.meetingTime ASC")
    List<Meeting> findUpcomingMeetingsForUser(User user, Instant now);

    // Find past meetings for a user (either as creator or participant)
    @Query("SELECT m FROM Meeting m WHERE (m.creator = ?1 OR m.participant = ?1) AND m.meetingTime <= ?2 ORDER BY m.meetingTime DESC")
    List<Meeting> findPastMeetingsForUser(User user, Instant now);

    // Find meetings by status for a user
    @Query("SELECT m FROM Meeting m WHERE (m.creator = ?1 OR m.participant = ?1) AND m.status = ?2 ORDER BY m.meetingTime ASC")
    List<Meeting> findMeetingsByStatusForUser(User user, MeetingStatus status);
    
    // Find meetings that need notification (upcoming within X time and not notified)
    @Query("SELECT m FROM Meeting m WHERE m.meetingTime > ?1 AND m.meetingTime <= ?2 AND (m.creatorNotified = false OR m.participantNotified = false)")
    List<Meeting> findMeetingsNeedingNotification(Instant now, Instant cutoff);
} 