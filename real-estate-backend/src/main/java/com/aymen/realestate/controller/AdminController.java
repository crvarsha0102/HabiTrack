package com.aymen.realestate.controller;

import com.aymen.realestate.dto.ApiResponse;
import com.aymen.realestate.model.User;
import com.aymen.realestate.repository.UserRepository;
import com.aymen.realestate.service.AdminService;
import com.aymen.realestate.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserService userService;

    @Autowired
    public AdminController(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestParam String email, @RequestParam String newPassword) {
        logger.info("Password reset request for email: {}", email);
        
        User user = userRepository.findByEmail(email);
        if (user == null) {
            logger.warn("Password reset failed: User not found for email {}", email);
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "User not found", null));
        }
        
        // Encode the new password
        String encodedPassword = passwordEncoder.encode(newPassword);
        user.setPassword(encodedPassword);
        
        // Save the user with the new password
        userRepository.save(user);
        
        logger.info("Password reset successful for email: {}", email);
        return ResponseEntity.ok(new ApiResponse<>(true, "Password reset successfully", null));
    }

    @GetMapping("/user-details")
    public ResponseEntity<ApiResponse<User>> getUserDetails(@RequestParam String email) {
        logger.info("User details request for email: {}", email);
        
        User user = userRepository.findByEmail(email);
        if (user == null) {
            logger.warn("User details request failed: User not found for email {}", email);
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "User not found", null));
        }
        
        // Create a copy of the user without the password
        User userResponse = new User();
        userResponse.setId(user.getId());
        userResponse.setEmail(user.getEmail());
        userResponse.setFirstName(user.getFirstName());
        userResponse.setLastName(user.getLastName());
        userResponse.setPhone(user.getPhone());
        userResponse.setAvatar(user.getAvatar());
        
        logger.info("User details retrieved successfully for email: {}", email);
        return ResponseEntity.ok(new ApiResponse<>(true, "User details retrieved successfully", userResponse));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        try {
            List<User> users = userService.findAll();
            return ResponseEntity.ok(new ApiResponse<>(true, "Users retrieved successfully", users));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<User>> getUser(@PathVariable Long id) {
        try {
            User user = userService.findById(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "User retrieved successfully", user));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PutMapping("/users/{id}/activate")
    public ResponseEntity<ApiResponse<User>> activateUser(@PathVariable Long id) {
        try {
            User user = userService.findById(id);
            user.setActive(true);
            User updatedUser = userService.save(user);
            return ResponseEntity.ok(new ApiResponse<>(true, "User activated successfully", updatedUser));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PutMapping("/users/{id}/deactivate")
    public ResponseEntity<ApiResponse<User>> deactivateUser(@PathVariable Long id) {
        try {
            User user = userService.findById(id);
            user.setActive(false);
            User updatedUser = userService.save(user);
            return ResponseEntity.ok(new ApiResponse<>(true, "User deactivated successfully", updatedUser));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "User deleted successfully", null));
    }
} 