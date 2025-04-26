package com.aymen.realestate.controller;

import com.aymen.realestate.config.JwtTokenProvider;
import com.aymen.realestate.dto.ApiResponse;
import com.aymen.realestate.model.Favorite;
import com.aymen.realestate.model.Listing;
import com.aymen.realestate.model.User;
import com.aymen.realestate.service.FavoriteService;
import com.aymen.realestate.service.UserService;
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
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private static final Logger logger = LoggerFactory.getLogger(FavoriteController.class);

    @Autowired
    private FavoriteService favoriteService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserService userService;

    /**
     * Get all favorited listings for the authenticated user
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Listing>>> getFavorites(
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
            
            // Get all favorited listings
            List<Listing> favorites = favoriteService.getFavoriteListings(userId);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Favorites retrieved successfully", favorites));
        } catch (JwtException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, "Token is not valid", null));
        } catch (Exception e) {
            logger.error("Error getting favorites: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Error retrieving favorites: " + e.getMessage(), null));
        }
    }

    /**
     * Check if a listing is favorited
     */
    @GetMapping("/{listingId}/check")
    public ResponseEntity<ApiResponse<Boolean>> checkFavoriteStatus(
            @PathVariable Long listingId,
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
            
            // Check if listing is favorited
            boolean isFavorite = favoriteService.isFavorite(userId, listingId);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Favorite status retrieved", isFavorite));
        } catch (JwtException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, "Token is not valid", null));
        } catch (Exception e) {
            logger.error("Error checking favorite status: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Error checking favorite status: " + e.getMessage(), null));
        }
    }

    /**
     * Toggle favorite status for a listing
     */
    @PostMapping("/{listingId}/toggle")
    public ResponseEntity<ApiResponse<Boolean>> toggleFavorite(
            @PathVariable Long listingId,
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
            
            // Toggle favorite status
            boolean isFavorite = favoriteService.toggleFavorite(userId, listingId);
            
            String message = isFavorite ? "Listing added to favorites" : "Listing removed from favorites";
            return ResponseEntity.ok(new ApiResponse<>(true, message, isFavorite));
        } catch (JwtException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, "Token is not valid", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        } catch (Exception e) {
            logger.error("Error toggling favorite: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Error toggling favorite: " + e.getMessage(), null));
        }
    }

    /**
     * Add a listing to favorites
     */
    @PostMapping("/{userId}/{listingId}")
    public ResponseEntity<ApiResponse<Favorite>> addFavorite(
            @PathVariable Long userId,
            @PathVariable Long listingId) {
        Favorite favorite = favoriteService.addFavorite(userId, listingId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Listing added to favorites", favorite));
    }

    /**
     * Remove a listing from favorites
     */
    @DeleteMapping("/{userId}/{listingId}")
    public ResponseEntity<ApiResponse<Void>> removeFavorite(
            @PathVariable Long userId,
            @PathVariable Long listingId) {
        favoriteService.removeFavorite(userId, listingId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Listing removed from favorites", null));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Listing>>> getUserFavorites(@PathVariable Long userId) {
        try {
            List<Listing> favorites = favoriteService.getUserFavorites(userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Favorites retrieved successfully", favorites));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/check")
    public ResponseEntity<ApiResponse<Boolean>> isFavorite(
            @RequestParam Long userId,
            @RequestParam Long listingId) {
        try {
            boolean isFavorite = favoriteService.isFavorite(userId, listingId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Favorite status retrieved successfully", isFavorite));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/listing/{listingId}/count")
    public ResponseEntity<ApiResponse<Long>> getFavoriteCount(@PathVariable Long listingId) {
        try {
            long count = favoriteService.getFavoriteCount(listingId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Favorite count retrieved successfully", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, e.getMessage(), null));
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
} 