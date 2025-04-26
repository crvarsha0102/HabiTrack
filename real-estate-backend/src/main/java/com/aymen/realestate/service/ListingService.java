package com.aymen.realestate.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.aymen.realestate.dto.ListingCreateRequest;
import com.aymen.realestate.dto.ListingGetQueryRequest;
import com.aymen.realestate.dto.ListingUpdateRequest;
import com.aymen.realestate.exception.UserNotFoundException;
import com.aymen.realestate.model.Listing;
import com.aymen.realestate.model.Listing.ListingStatus;
import com.aymen.realestate.model.PropertyType;
import com.aymen.realestate.model.User;
import com.aymen.realestate.repository.ListingRepository;
import com.aymen.realestate.repository.UserRepository;
import com.aymen.realestate.util.ImageUtils;

@Service
public class ListingService {
    
    private static final Logger logger = LoggerFactory.getLogger(ListingService.class);
    
    @Autowired
    private ListingRepository listingRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public Listing createListing(ListingCreateRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail);
        if (user == null) {
            logger.error("User not found with email: {}", userEmail);
            throw new UserNotFoundException("User not found with email: " + userEmail);
        }
        
        Listing listing = new Listing();
        listing.setName(request.getName());
        listing.setDescription(request.getDescription());
        listing.setAddress(request.getAddress());
        listing.setCity(request.getCity());
        listing.setState(request.getState());
        listing.setZipCode(request.getZipCode());
        listing.setPrice(request.getPrice());
        listing.setBedrooms(request.getBedrooms());
        listing.setBathrooms(request.getBathrooms());
        listing.setSquareFeet(request.getSquareFeet());
        listing.setFurnished(request.isFurnished());
        listing.setParking(request.isParking());
        
        // Set listingType if provided, default to SALE
        if (request.getListingType() != null && !request.getListingType().isEmpty()) {
            logger.info("Setting listing type to: {}", request.getListingType());
            listing.setListingType(request.getListingType());
        } else {
            logger.info("No listing type provided, defaulting to SALE");
            listing.setListingType("SALE");
        }

        if (request.getPropertyType() != null) {
            logger.info("Setting property type to: {}", request.getPropertyType());
            listing.setPropertyType(request.getPropertyType());
        } else {
            logger.info("No property type provided, defaulting to HOUSE");
            listing.setPropertyType(PropertyType.HOUSE);
        }
        
        // Set amenities if provided
        if (request.getAmenities() != null && !request.getAmenities().isEmpty()) {
            listing.setAmenities(request.getAmenities());
        } else {
            listing.setAmenities("");
        }
        
        // Validate and process images
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            List<String> validatedImages = request.getImageUrls().stream()
                .filter(ImageUtils::isValidBase64Image)
                .collect(Collectors.toList());
            
            if (validatedImages.isEmpty()) {
                // Use default image if all provided images are invalid
                listing.setImageUrls(List.of("https://i.imgur.com/n6B1Fuw.jpg"));
            } else {
                listing.setImageUrls(validatedImages);
            }
        } else {
            // Default image if none provided
            listing.setImageUrls(List.of("https://i.imgur.com/n6B1Fuw.jpg"));
        }
        
        // Set the status, default to ACTIVE if not provided
        if (request.getStatus() != null) {
            try {
                listing.setStatus(ListingStatus.valueOf(request.getStatus()));
            } catch (IllegalArgumentException e) {
                listing.setStatus(ListingStatus.ACTIVE);
            }
        } else {
            listing.setStatus(ListingStatus.ACTIVE);
        }
        
        listing.setUser(user);
        
        return listingRepository.save(listing);
    }
    
    public void deleteListing(Long id) {
        listingRepository.deleteById(id);
    }
    
    public Listing updateListing(Long id, ListingUpdateRequest request) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found with id: " + id));

        // Check if request attributes are not null before updating
        if (request.getName() != null) {
            listing.setName(request.getName());
        }
        
        if (request.getDescription() != null) {
            listing.setDescription(request.getDescription());
        }

        if (request.getAddress() != null) {
            listing.setAddress(request.getAddress());
        }
        
        if (request.getCity() != null) {
            listing.setCity(request.getCity());
        }
        
        if (request.getState() != null) {
            listing.setState(request.getState());
        }
        
        if (request.getZipCode() != null) {
            listing.setZipCode(request.getZipCode());
        }

        if (request.getBedrooms() != null) {
            listing.setBedrooms(request.getBedrooms());
        }
        
        if (request.getBathrooms() != null) {
            listing.setBathrooms(request.getBathrooms());
        }

        if (request.getSquareFeet() != null) {
            listing.setSquareFeet(request.getSquareFeet());
        }

        if (request.getPrice() != null) {
            listing.setPrice(request.getPrice());
        }

        if (request.isParking() != null) {
            listing.setParking(request.isParking());
        }

        if (request.isFurnished() != null) {
            listing.setFurnished(request.isFurnished());
        }
        
        if (request.getListingType() != null) {
            listing.setListingType(request.getListingType());
        }
        
        if (request.getPropertyType() != null) {
            listing.setPropertyType(request.getPropertyType());
        }
        
        if (request.getAmenities() != null) {
            listing.setAmenities(request.getAmenities());
        }
        
        if (request.getUrls() != null) {
            listing.setImageUrls(request.getUrls());
        }

        // Update the status if provided
        if (request.getStatus() != null) {
            try {
                listing.setStatus(ListingStatus.valueOf(request.getStatus()));
            } catch (IllegalArgumentException e) {
                // Keep the existing status if invalid value provided
            }
        }
        
        return listingRepository.save(listing);
    }
    
    public Listing getListing(Long id) {
        Listing listing = listingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found with id: " + id));
        
        // Populate owner information if available
        if (listing.getUser() != null) {
            User owner = listing.getUser();
            listing.setOwnerId(owner.getId());
            
            String ownerName = "";
            if (owner.getFirstName() != null && !owner.getFirstName().isEmpty()) {
                ownerName += owner.getFirstName();
            }
            if (owner.getLastName() != null && !owner.getLastName().isEmpty()) {
                ownerName += (ownerName.isEmpty() ? "" : " ") + owner.getLastName();
            }
            if (ownerName.isEmpty() && owner.getUsername() != null) {
                ownerName = owner.getUsername();
            }
            listing.setOwnerName(ownerName.isEmpty() ? "Property Owner" : ownerName);
            
            listing.setContactEmail(owner.getEmail());
            listing.setContactPhone(owner.getPhone());
        }
        
        return listing;
    }
    
    public List<Listing> getAllListings() {
        return listingRepository.findAll();
    }
    
    public List<Listing> getUserActiveListings(String userEmail) {
        User user = userRepository.findByEmail(userEmail);
        if (user == null) {
            logger.error("User not found with email: {}", userEmail);
            throw new UserNotFoundException("User not found with email: " + userEmail);
        }
        return listingRepository.findByUserAndStatus(user, ListingStatus.ACTIVE);
    }
    
    public Listing[] searchAndFilterListings(ListingGetQueryRequest request, boolean[] furnishedValues, boolean[] parkingValues) {
        Sort sort = Sort.by(request.getOrder().equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, request.getSort());
        int startIndex = Math.max(request.getStartIndex(), 0);
        int pageSize = Math.max(request.getLimit(), 1);

        int pageIndex = startIndex / pageSize;
        int pageOffset = startIndex % pageSize;

        // Get status from request or default to ACTIVE
        ListingStatus status = ListingStatus.ACTIVE;
        if (request.getStatus() != null) {
            try {
                status = ListingStatus.valueOf(request.getStatus());
            } catch (IllegalArgumentException e) {
                // Use default ACTIVE status if invalid value provided
            }
        }
        
        // Use the appropriate repository method based on the filters
        Pageable pageable = PageRequest.of(pageIndex, pageSize, sort);
        Page<Listing> page;
        
        boolean hasListingType = request.getListingType() != null && !request.getListingType().isEmpty();
        boolean hasPropertyType = request.getPropertyType() != null;
        boolean hasPriceRange = request.getMinPrice() != null || request.getMaxPrice() != null;
        
        Double minPrice = request.getMinPrice() != null ? request.getMinPrice() : 0.0;
        Double maxPrice = request.getMaxPrice() != null ? request.getMaxPrice() : Double.MAX_VALUE;
        
        logger.info("Searching listings with: listingType={}, hasListingType={}, propertyType={}, hasPropertyType={}, hasPriceRange={}", 
                request.getListingType(), hasListingType, request.getPropertyType(), hasPropertyType, hasPriceRange);
        
        if (hasListingType && hasPropertyType && hasPriceRange) {
            page = listingRepository.findByNameContainingIgnoreCaseAndFurnishedInAndParkingInAndStatusAndListingTypeAndPropertyTypeAndPriceBetween(
                    request.getSearchTerm(), furnishedValues, parkingValues, status, request.getListingType(), request.getPropertyType(), minPrice, maxPrice, pageable);
        } else if (hasListingType && hasPropertyType) {
            page = listingRepository.findByNameContainingIgnoreCaseAndFurnishedInAndParkingInAndStatusAndListingTypeAndPropertyType(
                    request.getSearchTerm(), furnishedValues, parkingValues, status, request.getListingType(), request.getPropertyType(), pageable);
        } else if (hasListingType && hasPriceRange) {
            page = listingRepository.findByNameContainingIgnoreCaseAndFurnishedInAndParkingInAndStatusAndListingTypeAndPriceBetween(
                    request.getSearchTerm(), furnishedValues, parkingValues, status, request.getListingType(), minPrice, maxPrice, pageable);
        } else if (hasPropertyType && hasPriceRange) {
            page = listingRepository.findByNameContainingIgnoreCaseAndFurnishedInAndParkingInAndStatusAndPropertyTypeAndPriceBetween(
                    request.getSearchTerm(), furnishedValues, parkingValues, status, request.getPropertyType(), minPrice, maxPrice, pageable);
        } else if (hasListingType) {
            page = listingRepository.findByNameContainingIgnoreCaseAndFurnishedInAndParkingInAndStatusAndListingType(
                    request.getSearchTerm(), furnishedValues, parkingValues, status, request.getListingType(), pageable);
        } else if (hasPropertyType) {
            page = listingRepository.findByNameContainingIgnoreCaseAndFurnishedInAndParkingInAndStatusAndPropertyType(
                    request.getSearchTerm(), furnishedValues, parkingValues, status, request.getPropertyType(), pageable);
        } else if (hasPriceRange) {
            page = listingRepository.findByNameContainingIgnoreCaseAndFurnishedInAndParkingInAndStatusAndPriceBetween(
                    request.getSearchTerm(), furnishedValues, parkingValues, status, minPrice, maxPrice, pageable);
        } else {
            page = listingRepository.findByNameContainingIgnoreCaseAndFurnishedInAndParkingInAndStatus(
                    request.getSearchTerm(), furnishedValues, parkingValues, status, pageable);
        }

        List<Listing> result = page.getContent();

        if (pageOffset > 0 && result.size() > pageOffset) {
            result = result.subList(pageOffset, result.size());
        }

        return result.toArray(new Listing[0]);
    }
    
    public List<Listing> getRecentListings(int limit) {
        // Use the existing findByStatus method instead of the non-existent findByStatusOrderByCreatedAtDesc
        List<Listing> listings = listingRepository.findByStatus(ListingStatus.ACTIVE);
        
        // Manually sort by created date (most recent first)
        listings.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        
        // Limit the number of results
        if (listings.size() > limit) {
            return listings.subList(0, limit);
        }
        
        return listings;
    }
}
