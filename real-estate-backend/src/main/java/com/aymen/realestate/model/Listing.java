package com.aymen.realestate.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "listings")
public class Listing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private String address;

    @Column(nullable = true)
    private String city;

    @Column(nullable = true)
    private String state;

    @Column(nullable = true)
    private String zipCode;

    @Column(name = "price", nullable = false)
    private Double price;

    @Column(nullable = true)
    private Integer bathrooms;

    @Column(nullable = true)
    private Integer bedrooms;

    @Column(nullable = true)
    private Integer squareFeet;

    @Column(nullable = true)
    private Boolean furnished;

    @Column(nullable = true)
    private Boolean parking;

    @Column(name = "amenities", columnDefinition = "TEXT")
    private String amenities;

    @ElementCollection
    @CollectionTable(name = "listing_image_urls", joinColumns = @JoinColumn(name = "listing_id"))
    @OrderColumn(name = "image_order")
    @Column(name = "image_url", columnDefinition = "MEDIUMTEXT")
    private List<String> imageUrls;

    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private ListingStatus status;

    @Column(name = "listing_type", nullable = false)
    private String listingType;

    @Column(name = "property_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private PropertyType propertyType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // Transient fields for owner information (not persisted)
    @Transient
    private Long ownerId;
    
    @Transient
    private String ownerName;
    
    @Transient
    private String contactEmail;
    
    @Transient
    private String contactPhone;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public enum ListingStatus {
        ACTIVE,
        PENDING,
        SOLD,
        DELETED
    }

    public Listing() {
        this.status = ListingStatus.ACTIVE;
        this.listingType = "SALE";
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        this.imageUrls = new ArrayList<>();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getZipCode() {
        return zipCode;
    }

    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Integer getBathrooms() {
        return bathrooms;
    }

    public void setBathrooms(Integer bathrooms) {
        this.bathrooms = bathrooms;
    }

    public Integer getBedrooms() {
        return bedrooms;
    }

    public void setBedrooms(Integer bedrooms) {
        this.bedrooms = bedrooms;
    }

    public Integer getSquareFeet() {
        return squareFeet;
    }

    public void setSquareFeet(Integer squareFeet) {
        this.squareFeet = squareFeet;
    }

    public Boolean getFurnished() {
        return furnished;
    }

    public void setFurnished(Boolean furnished) {
        this.furnished = furnished;
    }

    public Boolean getParking() {
        return parking;
    }

    public void setParking(Boolean parking) {
        this.parking = parking;
    }

    public String getAmenities() {
        return amenities;
    }

    public void setAmenities(String amenities) {
        this.amenities = amenities;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public ListingStatus getStatus() {
        return status;
    }

    public void setStatus(ListingStatus status) {
        this.status = status;
    }

    public String getListingType() {
        return listingType;
    }

    public void setListingType(String listingType) {
        this.listingType = listingType;
    }

    public PropertyType getPropertyType() {
        return propertyType;
    }

    public void setPropertyType(PropertyType propertyType) {
        this.propertyType = propertyType;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    @Override
    public String toString() {
        return "Listing{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", address='" + address + '\'' +
                ", city='" + city + '\'' +
                ", state='" + state + '\'' +
                ", zipCode='" + zipCode + '\'' +
                ", price=" + price +
                ", bathrooms=" + bathrooms +
                ", bedrooms=" + bedrooms +
                ", squareFeet=" + squareFeet +
                ", furnished=" + furnished +
                ", parking=" + parking +
                ", amenities='" + amenities + '\'' +
                ", imageUrls=" + imageUrls +
                ", user=" + user +
                ", status=" + status +
                ", listingType='" + listingType + '\'' +
                ", propertyType=" + propertyType +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                ", ownerId=" + ownerId +
                ", ownerName='" + ownerName + '\'' +
                ", contactEmail='" + contactEmail + '\'' +
                ", contactPhone='" + contactPhone + '\'' +
                '}';
    }
}