package com.aymen.realestate.controller;

import com.aymen.realestate.config.JwtTokenProvider;
import com.aymen.realestate.dto.ApiResponse;
import com.aymen.realestate.dto.UserUpdateRequest;
import com.aymen.realestate.model.Listing;
import com.aymen.realestate.model.User;
import com.aymen.realestate.service.UserService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PutMapping("/update/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(@PathVariable Long id,
                                        @RequestBody UserUpdateRequest request,
                                        @CookieValue(name = "access_token") String accessTokenCookie) {
        try {
            Jws<Claims> claimsJws = jwtTokenProvider.validateToken(accessTokenCookie);
            User updatedUser = userService.updateUser(id, request);
            return ResponseEntity.ok(new ApiResponse<>(true, "User updated successfully", updatedUser));
        } catch (JwtException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiResponse<>(false, "Token is not valid", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(false, "Error updating user", null));
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id,
                                        @CookieValue(name = "access_token") String accessTokenCookie) {
        try {
            Jws<Claims> claimsJws = jwtTokenProvider.validateToken(accessTokenCookie);
            userService.deleteUser(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "User deleted successfully", null));
        } catch (JwtException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiResponse<>(false, "Token is not valid", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(false, "Error deleting user", null));
        }
    }

    @GetMapping("/listings/{id}")
    public ResponseEntity<ApiResponse<List<Listing>>> getUserListings(@PathVariable Long id) {
        List<Listing> listings = userService.getUserListings(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "User listings retrieved successfully", listings));
    }

    @GetMapping("/listings/active/{id}")
    public ResponseEntity<ApiResponse<List<Listing>>> getUserActiveListings(@PathVariable Long id) {
        List<Listing> listings = userService.getUserActiveListings(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "User active listings retrieved successfully", listings));
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

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable Long id) {
        User user = userService.findById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "User retrieved successfully", user));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<User>> getUserByEmail(@PathVariable String email) {
        User user = userService.findByEmail(email);
        return ResponseEntity.ok(new ApiResponse<>(true, "User retrieved successfully", user));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<User>> createUser(@RequestBody User user) {
        User createdUser = userService.save(user);
        return ResponseEntity.ok(new ApiResponse<>(true, "User created successfully", createdUser));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(@PathVariable Long id, @RequestBody User user) {
        User updatedUser = userService.update(id, user);
        return ResponseEntity.ok(new ApiResponse<>(true, "User updated successfully", updatedUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "User deleted successfully", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = userService.findAll();
        return ResponseEntity.ok(new ApiResponse<>(true, "Users retrieved successfully", users));
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<ApiResponse<User>> getPublicUserInfo(@PathVariable Long id) {
        User user = userService.getUser(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Public user info retrieved successfully", user));
    }
}
