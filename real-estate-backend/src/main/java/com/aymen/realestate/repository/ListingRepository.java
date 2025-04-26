package com.aymen.realestate.repository;

import com.aymen.realestate.model.Listing;
import com.aymen.realestate.model.Listing.ListingStatus;
import com.aymen.realestate.model.PropertyType;
import com.aymen.realestate.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Pageable;
import java.util.List;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long> {
    List<Listing> findByUser(User user);

    List<Listing> findByStatus(ListingStatus status);

    List<Listing> findByUserAndStatus(User user, ListingStatus status);

    Page<Listing> findByNameContainingIgnoreCaseAndFurnishedInAndParkingIn(
            String searchTerm, boolean[] furnishedValues, boolean[] parkingValues, Pageable pageable
    );

    Page<Listing> findByNameContainingIgnoreCaseAndFurnishedInAndParkingInAndStatus(
            String searchTerm, boolean[] furnishedValues, boolean[] parkingValues, ListingStatus status, Pageable pageable
    );

    Page<Listing> findByNameContainingIgnoreCaseAndFurnishedInAndParkingInAndStatusAndListingType(
            String name, boolean[] furnished, boolean[] parking, ListingStatus status, String listingType, Pageable pageable
    );

    Page<Listing> findByNameContainingIgnoreCaseAndFurnishedInAndParkingInAndStatusAndPropertyType(
            String name, boolean[] furnished, boolean[] parking, ListingStatus status, PropertyType propertyType, Pageable pageable
    );

    Page<Listing> findByNameContainingIgnoreCaseAndFurnishedInAndParkingInAndStatusAndListingTypeAndPropertyType(
            String name, boolean[] furnished, boolean[] parking, ListingStatus status, String listingType, PropertyType propertyType, Pageable pageable
    );

    Page<Listing> findByNameContainingIgnoreCaseAndFurnishedInAndParkingInAndStatusAndPriceBetween(
            String name, boolean[] furnished, boolean[] parking, ListingStatus status, Double minPrice, Double maxPrice, Pageable pageable
    );

    Page<Listing> findByNameContainingIgnoreCaseAndFurnishedInAndParkingInAndStatusAndListingTypeAndPriceBetween(
            String name, boolean[] furnished, boolean[] parking, ListingStatus status, String listingType, Double minPrice, Double maxPrice, Pageable pageable
    );

    Page<Listing> findByNameContainingIgnoreCaseAndFurnishedInAndParkingInAndStatusAndPropertyTypeAndPriceBetween(
            String name, boolean[] furnished, boolean[] parking, ListingStatus status, PropertyType propertyType, Double minPrice, Double maxPrice, Pageable pageable
    );

    Page<Listing> findByNameContainingIgnoreCaseAndFurnishedInAndParkingInAndStatusAndListingTypeAndPropertyTypeAndPriceBetween(
            String name, boolean[] furnished, boolean[] parking, ListingStatus status, String listingType, PropertyType propertyType, Double minPrice, Double maxPrice, Pageable pageable
    );
}