package com.aymen.realestate.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

import com.aymen.realestate.repository.UserRepository;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    public WebSecurityConfig(JwtTokenProvider jwtTokenProvider, UserRepository userRepository) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userRepository = userRepository;
    }

    // Configure security filter chain to handle HTTP security
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors((cors) -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(
                        auth -> auth
                            .requestMatchers("/api/auth/**").permitAll() // Allow all auth endpoints
                            .requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN") // Admin endpoints require ROLE_ADMIN
                            .anyRequest().permitAll() // For now, allow all other requests
                )
                .csrf(csrf -> csrf.disable()) // Disable CSRF protection
                .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider, userRepository), 
                                 UsernamePasswordAuthenticationFilter.class); // Add our JWT filter
        return http.build();
    }

    // Configure CORS (Cross-Origin Resource Sharing) to allow requests from specific origins
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Set the allowed origins, methods, and headers
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:4200", 
            "http://127.0.0.1:4200", 
            "https://real-estate-marketplace-application-front-end.vercel.app"
        ));
        configuration.setAllowedMethods(Arrays.asList("HEAD", "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")); // Allow all methods
        configuration.setAllowCredentials(true);
        configuration.setAllowedHeaders(Arrays.asList(
            "Content-Type", 
            "X-Auth-Token", 
            "Authorization", 
            "Access-Control-Allow-Origin", 
            "Access-Control-Allow-Credentials",
            "Cookie"
        ));
        configuration.setExposedHeaders(Arrays.asList(
            "Content-Type", 
            "X-Auth-Token", 
            "Authorization", 
            "Access-Control-Allow-Origin", 
            "Access-Control-Allow-Credentials",
            "Set-Cookie"
        ));
        
        // Increase max age to avoid preflight requests
        configuration.setMaxAge(3600L);

        // Set up URL-based CORS configuration source
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }
}