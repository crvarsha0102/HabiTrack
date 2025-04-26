package com.aymen.realestate.repository;

import com.aymen.realestate.model.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUserId(Long userId);
    List<Favorite> findByListingId(Long listingId);
    Optional<Favorite> findByUserIdAndListingId(Long userId, Long listingId);
    boolean existsByUserIdAndListingId(Long userId, Long listingId);
    void deleteByUserIdAndListingId(Long userId, Long listingId);
    long countByListingId(Long listingId);
} 