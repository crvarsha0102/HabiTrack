package com.aymen.realestate.dto;

import com.aymen.realestate.model.Listing;
import com.aymen.realestate.model.User;
import jakarta.servlet.http.Cookie;
import java.util.List;
import lombok.Data;

@Data
public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;
    private List<Listing> listings;
    private String accessToken;
    private String refreshToken;

    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }
    
    public ApiResponse(boolean success, String message, T data, List<Listing> listings) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.listings = listings;
    }

    public ApiResponse(boolean success, String message, T data, List<Listing> listings, String accessToken, String refreshToken) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.listings = listings;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    public boolean isSuccess() {
        return success;
    }

    public T getData() {
        return data;
    }
    
    // For backward compatibility
    public User getUser() {
        return (data instanceof User) ? (User) data : null;
    }

    public List<Listing> getListings() {
        return listings;
    }

    public String getMessage() {
        return message;
    }
    
    public String getAccessToken() {
        return accessToken;
    }
    
    public String getRefreshToken() {
        return refreshToken;
    }
}
