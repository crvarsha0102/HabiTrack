package com.aymen.realestate.repository;

import com.aymen.realestate.model.Message;
import com.aymen.realestate.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findBySenderOrderByCreatedAtDesc(User sender);
    List<Message> findByReceiverOrderByCreatedAtDesc(User receiver);
    List<Message> findBySenderAndReceiverOrderByCreatedAtDesc(User sender, User receiver);
    List<Message> findByPropertyIdOrderByCreatedAtDesc(Long propertyId);
    List<Message> findByReceiverAndIsReadFalse(User receiver);
} 