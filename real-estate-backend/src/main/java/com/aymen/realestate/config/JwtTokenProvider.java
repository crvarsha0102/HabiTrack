package com.aymen.realestate.config;

import com.aymen.realestate.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.security.Keys;


import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${app.jwt.secret-key}")
    private String jwtSecretKey;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    public String generateToken(User user) {
        Date expiration = new Date(System.currentTimeMillis() + (10 * 365 * 24 * 60 * 60 * 1000));
        SecretKey key = Keys.hmacShaKeyFor(jwtSecretKey.getBytes());

        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("userId", user.getId())
                .setIssuedAt(new Date())
                .setExpiration(expiration)
                .signWith(key)
                .compact();
    }

    public Jws<Claims> validateToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecretKey.getBytes());

        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
    }
    
    public Long getUserIdFromJWT(String token) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecretKey.getBytes());
        
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
                
        return claims.get("userId", Long.class);
    }
}