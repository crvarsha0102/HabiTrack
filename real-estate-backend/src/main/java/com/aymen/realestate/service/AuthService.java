package com.aymen.realestate.service;

import com.aymen.realestate.config.JwtTokenProvider;
import com.aymen.realestate.dto.ApiResponse;
import com.aymen.realestate.dto.SignInResponse;
import com.aymen.realestate.model.User;
import com.aymen.realestate.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import jakarta.servlet.http.Cookie;
import org.apache.commons.lang3.RandomStringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    public AuthService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider, UserService userService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public void signUp(String firstName, String lastName, String email, String password, String phone) {
        try {
            // Check if user already exists
            if (userRepository.findByEmail(email) != null) {
                throw new RuntimeException("User with this email already exists");
            }

            String hashedPassword = passwordEncoder.encode(password);
            
            // Use the constructor that matches our needs
            User user;
            if (phone != null && !phone.isEmpty()) {
                user = new User(firstName, lastName, email, hashedPassword, phone);
            } else {
                user = new User(firstName, lastName, email, hashedPassword);
            }
            
            userRepository.save(user);
        } catch (Exception e) {
            logger.error("Error during user registration: ", e);
            throw new RuntimeException("Error during user registration: " + e.getMessage(), e);
        }
    }

    public SignInResponse signIn(String email, String password) {
        logger.info("Attempting login for email: {}", email);

        User user = userRepository.findByEmail(email);

        if (user == null) {
            logger.warn("Login failed: User not found for email {}", email);
            return new SignInResponse(false, "Wrong credentials!", null, null);
        }

        // Debug password match
        boolean passwordMatches = passwordEncoder.matches(password, user.getPassword());
        logger.info("Password verification for {}: {}", email, passwordMatches ? "SUCCESS" : "FAILED");
        
        if (passwordMatches) {
            logger.info("Generating JWT token for user: {}", email);
            String token = jwtTokenProvider.generateToken(user);

            // Set up cookie with SameSite=None to work cross-origin
            Cookie cookie = new Cookie("access_token", token);
            cookie.setHttpOnly(true);
            cookie.setPath("/");
            cookie.setMaxAge(86400 * 10); // 10 days
            
            // Don't expose password in response
            user.setPassword("");

            logger.info("Login successful for user: {}", email);
            return new SignInResponse(true, "Authentication successful", user, cookie);
        } else {
            logger.warn("Login failed: Invalid password for user {}", email);
            return new SignInResponse(false, "Wrong credentials!", null, null);
        }
    }

    public SignInResponse googleAuth(String email, String username, String avatar) {
        User existingUser = userRepository.findByEmail(email);

        if (existingUser != null) {
            String token = jwtTokenProvider.generateToken(existingUser);

            Cookie cookie = new Cookie("access_token", token);
            cookie.setHttpOnly(true);
            cookie.setPath("/");

            existingUser.setPassword(null);

            return new SignInResponse(true, "success creating cookie", existingUser, cookie);
        } else {
            // Create new user - split username into first and last name
            String firstName = username;
            String lastName = "";
            
            // If username contains a space, split it into first and last name
            if (username.contains(" ")) {
                String[] nameParts = username.split(" ", 2);
                firstName = nameParts[0];
                lastName = nameParts[1];
            }

            String generatedPassword = RandomStringUtils.random(8, true, true);
            String hashedPassword = passwordEncoder.encode(generatedPassword);

            // Use the correct constructor
            User newUser = new User(firstName, lastName, email, hashedPassword);
            
            // Set avatar if provided
            if (avatar != null && !avatar.isEmpty()) {
                newUser.setAvatar(avatar);
            }

            userRepository.save(newUser);

            String token = jwtTokenProvider.generateToken(newUser);

            Cookie cookie = new Cookie("access_token", token);
            cookie.setHttpOnly(true);
            cookie.setPath("/");

            System.out.println("####### user doesn't exist details are: " + newUser.toString());

            newUser.setPassword(null);

            return new SignInResponse(true, "success creating cookie", newUser, cookie);
        }
    }

    public void signOut(HttpServletResponse response) {
        Cookie cookie = new Cookie("access_token", null);
        cookie.setMaxAge(0);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        response.addCookie(cookie);
    }

    public void register(User user) {
        try {
            // Check if user already exists
            if (userRepository.findByEmail(user.getEmail()) != null) {
                throw new RuntimeException("User with this email already exists");
            }

            // Hash password
            String hashedPassword = passwordEncoder.encode(user.getPassword());
            user.setPassword(hashedPassword);
            
            // If role is null, set default to USER
            if (user.getRole() == null) {
                user.setRole(User.UserRole.USER);
            }
            
            userRepository.save(user);
            
            logger.info("User registered successfully: {} with role {}", user.getEmail(), user.getRole());
        } catch (Exception e) {
            logger.error("Error during user registration: ", e);
            throw new RuntimeException("Error during user registration: " + e.getMessage(), e);
        }
    }

    public SignInResponse login(String email, String password) {
        return signIn(email, password);
    }

    public void logout(HttpServletResponse response) {
        signOut(response);
    }

    public String refreshToken(String oldToken) {
        try {
            Jws<Claims> claimsJws = jwtTokenProvider.validateToken(oldToken);
            if (claimsJws != null) {
                String email = claimsJws.getBody().getSubject();
                User user = userRepository.findByEmail(email);
                if (user != null) {
                    return jwtTokenProvider.generateToken(user);
                }
            }
            throw new RuntimeException("Invalid refresh token");
        } catch (JwtException e) {
            throw new RuntimeException("Invalid refresh token: " + e.getMessage());
        }
    }

    public void sendPasswordResetEmail(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found with email: " + email);
        }
        // TODO: Implement email sending logic
        logger.info("Password reset email would be sent to: {}", email);
    }

    public void resetPassword(String token, String newPassword) {
        try {
            Jws<Claims> claimsJws = jwtTokenProvider.validateToken(token);
            if (claimsJws != null) {
                String email = claimsJws.getBody().getSubject();
                User user = userRepository.findByEmail(email);
                if (user != null) {
                    String hashedPassword = passwordEncoder.encode(newPassword);
                    user.setPassword(hashedPassword);
                    userRepository.save(user);
                    return;
                }
            }
            throw new RuntimeException("Invalid reset token");
        } catch (JwtException e) {
            throw new RuntimeException("Invalid reset token: " + e.getMessage());
        }
    }

    public User getUserFromToken(String token) {
        try {
            Jws<Claims> claimsJws = jwtTokenProvider.validateToken(token);
            if (claimsJws != null) {
                String email = claimsJws.getBody().getSubject();
                return userRepository.findByEmail(email);
            }
            return null;
        } catch (JwtException e) {
            logger.warn("Invalid token: {}", e.getMessage());
            return null;
        }
    }
}
