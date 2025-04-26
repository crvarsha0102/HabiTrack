package com.aymen.realestate.config;

import com.aymen.realestate.model.User;
import com.aymen.realestate.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider, UserRepository userRepository) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // Check for token in Authorization header
            String token = extractTokenFromRequest(request);
            
            if (token != null) {
                logger.info("Found JWT token, attempting to validate");
                try {
                    Jws<Claims> claims = jwtTokenProvider.validateToken(token);
                    String email = claims.getBody().getSubject();
                    
                    // Get user from repository
                    User user = userRepository.findByEmail(email);
                    
                    if (user != null) {
                        // Create authentication token with proper role based on user's role
                        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                                user,
                                null,
                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
                        );
                        
                        // Set authentication in context
                        SecurityContextHolder.getContext().setAuthentication(auth);
                        logger.info("Successfully authenticated user: {}", email);
                    } else {
                        logger.warn("User not found for email: {}", email);
                    }
                } catch (Exception e) {
                    logger.error("Failed to validate token: {}", e.getMessage());
                }
            }
        } catch (Exception e) {
            logger.error("Error processing JWT authentication: {}", e.getMessage());
        }
        
        filterChain.doFilter(request, response);
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        // First try to get from Authorization header
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        
        // If not in header, try cookies
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("access_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        
        return null;
    }
} 