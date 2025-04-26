package com.aymen.realestate.controller;

import com.aymen.realestate.dto.ApiResponse;
import com.aymen.realestate.dto.SignInResponse;
import com.aymen.realestate.dto.UserSigninRequest;
import com.aymen.realestate.dto.UserSignupRequest;
import com.aymen.realestate.model.User;
import com.aymen.realestate.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@RequestBody UserSignupRequest request, HttpServletResponse httpServletResponse) {
        try {
            // Create user object
            User user = new User();
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());
            user.setPhone(request.getPhone());
            
            // Set role if provided
            if (request.getRole() != null && !request.getRole().isEmpty()) {
                try {
                    user.setRole(User.UserRole.valueOf(request.getRole().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    // If invalid role, default to USER
                    user.setRole(User.UserRole.USER);
                }
            }
            
            // Register the user (this saves to DB)
            authService.register(user);
            
            // Now login the user to create a cookie
            SignInResponse signInResponse = authService.login(request.getEmail(), request.getPassword());
            
            // Add the cookie to the response if it exists
            if (signInResponse.cookie() != null) {
                Cookie cookie = signInResponse.cookie();
                
                // Use header to set SameSite attribute which isn't supported by javax.servlet.http.Cookie
                String cookieString = String.format("%s=%s; Path=%s; HttpOnly; Max-Age=%d; SameSite=Lax", 
                                                  cookie.getName(), 
                                                  cookie.getValue(), 
                                                  cookie.getPath(),
                                                  cookie.getMaxAge());
                httpServletResponse.addHeader("Set-Cookie", cookieString);
            }
            
            // Return the user without password
            user.setPassword("");
            return ResponseEntity.ok(new ApiResponse<>(true, "User registered successfully", user));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<SignInResponse>> login(@RequestBody UserSigninRequest request, HttpServletResponse httpServletResponse) {
        try {
            SignInResponse response = authService.login(request.getEmail(), request.getPassword());
            
            // Add the cookie to the response if it exists
            if (response.cookie() != null) {
                Cookie cookie = response.cookie();
                
                // Use header to set SameSite attribute which isn't supported by javax.servlet.http.Cookie
                String cookieString = String.format("%s=%s; Path=%s; HttpOnly; Max-Age=%d; SameSite=Lax", 
                                                   cookie.getName(), 
                                                   cookie.getValue(), 
                                                   cookie.getPath(),
                                                   cookie.getMaxAge());
                httpServletResponse.addHeader("Set-Cookie", cookieString);
            }
            
            return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletResponse response) {
        try {
            authService.logout(response);
            return ResponseEntity.ok(new ApiResponse<>(true, "Logged out successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<String>> refreshToken(@RequestParam String token) {
        try {
            String newToken = authService.refreshToken(token);
            return ResponseEntity.ok(new ApiResponse<>(true, "Token refreshed successfully", newToken));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestParam String email) {
        try {
            authService.sendPasswordResetEmail(email);
            return ResponseEntity.ok(new ApiResponse<>(true, "Password reset email sent", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @RequestParam String token,
            @RequestParam String newPassword) {
        try {
            authService.resetPassword(token, newPassword);
            return ResponseEntity.ok(new ApiResponse<>(true, "Password reset successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/current-user")
    public ResponseEntity<ApiResponse<User>> getCurrentUser(HttpServletRequest request) {
        try {
            // Get the token from the cookie or authorization header
            String token = null;
            Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if ("access_token".equals(cookie.getName())) {
                        token = cookie.getValue();
                        break;
                    }
                }
            }
            
            // If token not found in cookies, try Authorization header
            if (token == null) {
                String authHeader = request.getHeader("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    token = authHeader.substring(7);
                }
            }
            
            // If no token found, return unauthorized
            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "Not authenticated", null));
            }
            
            // Validate token and get user
            User user = authService.getUserFromToken(token);
            if (user != null) {
                // Don't expose the password
                user.setPassword("");
                return ResponseEntity.ok(new ApiResponse<>(true, "User retrieved successfully", user));
            }
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse<>(false, "Invalid token", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
}
