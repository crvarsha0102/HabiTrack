package com.aymen.realestate.exception;

public class ListingNotFoundException extends RuntimeException {
    public ListingNotFoundException(String message) {
        super(message);
    }
} 