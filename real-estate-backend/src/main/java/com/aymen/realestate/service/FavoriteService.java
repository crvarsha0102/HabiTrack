package com.aymen.realestate.service;

import com.aymen.realestate.model.Favorite;
import com.aymen.realestate.model.Listing;
import com.aymen.realestate.repository.FavoriteRepository;
import com.aymen.realestate.repository.ListingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private ListingRepository listingRepository;

    /**
     * Get all listings favorited by a user
     */
    public List<Listing> getFavoriteListings(Long userId) {
        List<Favorite> favorites = favoriteRepository.findByUserId(userId);
        List<Long> listingIds = favorites.stream()
                .map(Favorite::getListingId)
                .collect(Collectors.toList());
        
        if (listingIds.isEmpty()) {
            return new ArrayList<>();
        }
        
        return listingRepository.findAllById(listingIds);
    }

    /**
     * Check if a listing is favorited by a user
     */
    public boolean isFavorite(Long userId, Long listingId) {
        return favoriteRepository.existsByUserIdAndListingId(userId, listingId);
    }

    /**
     * Add a listing to user's favorites
     */
    @Transactional
    public Favorite addFavorite(Long userId, Long listingId) {
        // Check if already favorited
        Optional<Favorite> existingFavorite = favoriteRepository.findByUserIdAndListingId(userId, listingId);
        if (existingFavorite.isPresent()) {
            return existingFavorite.get();
        }
        
        // Check if listing exists
        if (!listingRepository.existsById(listingId)) {
            throw new IllegalArgumentException("Listing not found with id: " + listingId);
        }
        
        // Create new favorite
        Favorite favorite = new Favorite(userId, listingId);
        return favoriteRepository.save(favorite);
    }

    /**
     * Remove a listing from user's favorites
     */
    @Transactional
    public void removeFavorite(Long userId, Long listingId) {
        favoriteRepository.deleteByUserIdAndListingId(userId, listingId);
    }

    /**
     * Toggle favorite status for a listing
     */
    @Transactional
    public boolean toggleFavorite(Long userId, Long listingId) {
        boolean isFavorite = favoriteRepository.existsByUserIdAndListingId(userId, listingId);
        
        if (isFavorite) {
            favoriteRepository.deleteByUserIdAndListingId(userId, listingId);
            return false;
        } else {
            addFavorite(userId, listingId);
            return true;
        }
    }

    public List<Listing> getUserFavorites(Long userId) {
        return getFavoriteListings(userId);
    }

    public long getFavoriteCount(Long listingId) {
        return favoriteRepository.countByListingId(listingId);
    }
} 