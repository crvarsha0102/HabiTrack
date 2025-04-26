package com.aymen.realestate.dto;

import com.aymen.realestate.model.PropertyType;

public class ListingGetQueryRequest {
    private String searchTerm;
    private String sort;
    private String order;
    private Integer limit;
    private Integer startIndex;
    private String status;
    private String listingType;
    private PropertyType propertyType;
    private Double minPrice;
    private Double maxPrice;

    public String getSearchTerm() {
        return searchTerm;
    }

    public void setSearchTerm(String searchTerm) {
        this.searchTerm = searchTerm;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSort() {
        return sort;
    }

    public void setSort(String sort) {
        this.sort = sort;
    }

    public String getOrder() {
        return order;
    }

    public void setOrder(String order) {
        this.order = order;
    }

    public Integer getLimit() {
        return limit;
    }

    public void setLimit(Integer limit) {
        this.limit = limit;
    }

    public Integer getStartIndex() {
        return startIndex;
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

    public Double getMinPrice() {
        return minPrice;
    }

    public void setMinPrice(Double minPrice) {
        this.minPrice = minPrice;
    }

    public Double getMaxPrice() {
        return maxPrice;
    }

    public void setMaxPrice(Double maxPrice) {
        this.maxPrice = maxPrice;
    }

    @Override
    public String toString() {
        return "ListingGetQueryRequest{" +
                "searchTerm='" + searchTerm + '\'' +
                ", sort='" + sort + '\'' +
                ", order='" + order + '\'' +
                ", limit=" + limit +
                ", startIndex=" + startIndex +
                ", status='" + status + '\'' +
                ", listingType='" + listingType + '\'' +
                ", propertyType=" + propertyType +
                ", minPrice=" + minPrice +
                ", maxPrice=" + maxPrice +
                '}';
    }

    public void setStartIndex(Integer startIndex) {
        this.startIndex = startIndex;
    }
}
