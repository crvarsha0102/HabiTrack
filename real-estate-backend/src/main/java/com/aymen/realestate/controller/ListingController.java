package com.aymen.realestate.controller;

import com.aymen.realestate.config.JwtTokenProvider;
import com.aymen.realestate.dto.ApiResponse;
import com.aymen.realestate.dto.ListingCreateRequest;
import com.aymen.realestate.dto.ListingGetQueryRequest;
import com.aymen.realestate.dto.ListingUpdateRequest;
import com.aymen.realestate.model.Listing;
import com.aymen.realestate.model.Listing.ListingStatus;
import com.aymen.realestate.model.PropertyType;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import com.aymen.realestate.service.ListingService;
import com.aymen.realestate.model.User;
import com.aymen.realestate.repository.UserRepository;
import com.aymen.realestate.exception.UserNotFoundException;

import java.util.List;

@RestController
@RequestMapping("/api/listings")
public class ListingController {

    @Autowired
    private ListingService listingService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    private static final Logger logger = LoggerFactory.getLogger(ListingController.class);

    // Helper method to extract token from request (either from cookie or Authorization header)
    private String getTokenFromRequest(HttpServletRequest request) {
        // Try to get from cookie first
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("access_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        
        // If no cookie, try Authorization header
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        
        return null;
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Listing>> createListing(
            @RequestBody ListingCreateRequest request,
            HttpServletRequest httpRequest) {
        
        try {
            // Get token from either cookie or Authorization header
            String token = getTokenFromRequest(httpRequest);
            
            if (token == null) {
                logger.error("No authentication token provided for listing creation");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "No authentication token provided", null));
            }

            String userEmail;
            try {
                Jws<Claims> claimsJws = jwtTokenProvider.validateToken(token);
                userEmail = claimsJws.getBody().getSubject();
                logger.info("Valid token provided by user: {}", userEmail);
            } catch (JwtException e) {
                logger.error("Invalid token: {}", e.getMessage());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "Invalid authentication token", null));
            }

            try {
                // Create the listing with the validated user email
                Listing createdListing = listingService.createListing(request, userEmail);
                
                logger.info("Created listing: {} for user: {}", createdListing.getId(), userEmail);
                
                return ResponseEntity.ok(new ApiResponse<>(true, "Listing created successfully", createdListing));
            } catch (UserNotFoundException e) {
                logger.error("User not found: {}", e.getMessage());
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
            }
        } catch (Exception e) {
            logger.error("Error creating listing: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, "Error creating listing: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteListing(
            @PathVariable Long id,
            HttpServletRequest httpRequest) {
        
        try {
            String token = getTokenFromRequest(httpRequest);
            
            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "No authentication token provided", null));
            }
            
            Jws<Claims> claimsJws = jwtTokenProvider.validateToken(token);
            listingService.deleteListing(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Listing deleted successfully", null));
        } catch (JwtException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ApiResponse<>(false, "Token is not valid", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error deleting listing", null));
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ApiResponse<Listing>> updateListing(
            @PathVariable Long id,
            @RequestBody ListingUpdateRequest request,
            HttpServletRequest httpRequest) {
        
        try {
            String token = getTokenFromRequest(httpRequest);
            
            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "No authentication token provided", null));
            }
            
            Jws<Claims> claimsJws = jwtTokenProvider.validateToken(token);
            Listing updatedListing = listingService.updateListing(id, request);
            return ResponseEntity.ok(new ApiResponse<>(true, "Listing updated successfully", updatedListing));
        } catch (JwtException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ApiResponse<>(false, "Token is not valid", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error updating listing", null));
        }
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<ApiResponse<Listing>> getListing(@PathVariable Long id) {
        try {
            Listing listing = listingService.getListing(id);
            
            // Create a safe User object without circular references
            User owner = null;
            if (listing.getUser() != null) {
                User fullUser = listing.getUser();
                owner = new User();
                owner.setId(fullUser.getId());
                owner.setUsername(fullUser.getUsername());
                owner.setFirstName(fullUser.getFirstName());
                owner.setLastName(fullUser.getLastName());
                owner.setEmail(fullUser.getEmail());
                owner.setPhone(fullUser.getPhone());
                owner.setAvatar(fullUser.getAvatar());
                // Don't include listings to avoid circular reference
                
                // Set owner information in the listing itself
                listing.setOwnerId(owner.getId());
                listing.setOwnerName(owner.getFirstName() + " " + owner.getLastName());
                listing.setContactEmail(owner.getEmail());
                listing.setContactPhone(owner.getPhone());
            }
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Listing retrieved successfully", listing));
        } catch (Exception e) {
            logger.error("Error getting listing with id {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error getting listing: " + e.getMessage(), null));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Listing>>> getListings(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String order,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer startIndex,
            @RequestParam(required = false) Boolean furnished,
            @RequestParam(required = false) Boolean parking,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String listingType,
            @RequestParam(required = false) String propertyType,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {
        
        ListingGetQueryRequest request = new ListingGetQueryRequest();
        
        logger.info("Searching listings with params: searchTerm={}, status={}, listingType={}, propertyType={}, minPrice={}, maxPrice={}",
                searchTerm, status, listingType, propertyType, minPrice, maxPrice);

        try {
            boolean[] furnishedValues;
            boolean[] parkingValues;

            if (limit == null) {
                request.setLimit(9);
            } else {
                request.setLimit(limit);
            }

            if (startIndex == null || startIndex < 0) {
                request.setStartIndex(0);
            } else {
                request.setStartIndex(startIndex);
            }

            if (sort == null) {
                request.setSort("createdAt");
            } else {
                request.setSort(sort);
            }

            if (order == null) {
                request.setOrder("desc");
            } else {
                request.setOrder(order);
            }

            if (searchTerm == null) {
                request.setSearchTerm("");
            } else {
                request.setSearchTerm(searchTerm);
            }

            if (furnished == null) {
                furnishedValues = new boolean[] {true, false};
            } else {
                furnishedValues = new boolean[] {furnished};
            }

            if (parking == null) {
                parkingValues = new boolean[] {true, false};
            } else {
                parkingValues = new boolean[] {parking};
            }

            if (status != null) {
                request.setStatus(status);
                logger.info("Setting status filter to: {}", status);
            }
            
            if (listingType != null && !listingType.isEmpty()) {
                request.setListingType(listingType);
                logger.info("Setting listingType filter to: {}", listingType);
            }
            
            if (propertyType != null && !propertyType.isEmpty()) {
                request.setPropertyType(PropertyType.valueOf(propertyType));
                logger.info("Setting propertyType filter to: {}", propertyType);
            }
            
            if (minPrice != null) {
                request.setMinPrice(minPrice);
                logger.info("Setting minPrice filter to: {}", minPrice);
            }
            
            if (maxPrice != null) {
                request.setMaxPrice(maxPrice);
                logger.info("Setting maxPrice filter to: {}", maxPrice);
            }

            Listing[] listings = listingService.searchAndFilterListings(request, furnishedValues, parkingValues);
            
            // Force initialize user information for each listing
            for (Listing listing : listings) {
                if (listing.getUser() != null) {
                    // This will force initialization of the User object
                    listing.getUser().getUsername();
                }
            }

            return ResponseEntity.ok(new ApiResponse<>(true, "Listings retrieved successfully", List.of(listings)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error retrieving listings", null));
        }
    }

    @PutMapping("/status/{id}")
    public ResponseEntity<ApiResponse<Listing>> updateListingStatus(
            @PathVariable Long id, 
            @RequestParam String status,
            HttpServletRequest httpRequest) {
        
        try {
            String token = getTokenFromRequest(httpRequest);
            
            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "No authentication token provided", null));
            }
            
            Jws<Claims> claimsJws = jwtTokenProvider.validateToken(token);
            
            Listing existingListing = listingService.getListing(id);
            
            try {
                existingListing.setStatus(ListingStatus.valueOf(status));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "Invalid status value. Valid values are: " + 
                          java.util.Arrays.toString(ListingStatus.values()), null));
            }
            
            ListingUpdateRequest updateRequest = new ListingUpdateRequest();
            updateRequest.setStatus(status);
            
            Listing updatedListing = listingService.updateListing(id, updateRequest);
            return ResponseEntity.ok(new ApiResponse<>(true, "Listing status updated successfully", updatedListing));
        } catch (JwtException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ApiResponse<>(false, "Token is not valid", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Error updating listing status: " + e.getMessage(), null));
        }
    }

    @GetMapping("/user")
    public ResponseEntity<ApiResponse<List<Listing>>> getUserListings(HttpServletRequest httpRequest) {
        try {
            String token = getTokenFromRequest(httpRequest);
            logger.info("Getting user listings with token: {}", token != null ? "Token present" : "No token");
            
            if (token == null) {
                logger.warn("No authentication token provided for /user endpoint");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "No authentication token provided", null));
            }
            
            try {
                Jws<Claims> claimsJws = jwtTokenProvider.validateToken(token);
                String userEmail = claimsJws.getBody().getSubject();
                logger.info("Token validated successfully for user: {}", userEmail);
                
                try {
                    List<Listing> userListings = listingService.getUserActiveListings(userEmail);
                    logger.info("Found {} listings for user {}", userListings.size(), userEmail);
                    return ResponseEntity.ok(new ApiResponse<>(true, "User listings retrieved successfully", userListings));
                } catch (UserNotFoundException e) {
                    logger.error("User not found: {}", e.getMessage());
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, e.getMessage(), null));
                }
            } catch (JwtException e) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(false, "Token is not valid", null));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Error getting user listings: " + e.getMessage(), null));
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("API is working!");
    }

    @GetMapping("/get")
    public ResponseEntity<ApiResponse<List<Listing>>> searchAndFilterListings(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String order,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) Integer startIndex,
            @RequestParam(required = false) Boolean furnished,
            @RequestParam(required = false) Boolean parking,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String listingType,
            @RequestParam(required = false) String propertyType,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {
        
        logger.info("Using legacy /get endpoint");
        
        // Forward to the main endpoint
        return getListings(searchTerm, sort, order, limit, startIndex, 
                           furnished, parking, status, listingType, propertyType, minPrice, maxPrice);
    }
}
