package com.aymen.realestate.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Base64;
import java.util.regex.Pattern;

/**
 * Utility class for handling base64 encoded images
 */
public class ImageUtils {
    
    private static final Logger logger = LoggerFactory.getLogger(ImageUtils.class);
    private static final int MAX_BASE64_SIZE = 1024 * 1024 * 10; // 10MB limit
    private static final Pattern BASE64_PATTERN = Pattern.compile("^data:image/(jpeg|jpg|png|gif);base64,.*");
    
    /**
     * Validates a base64 encoded image
     * @param base64Image The base64 image string to validate
     * @return true if valid, false otherwise
     */
    public static boolean isValidBase64Image(String base64Image) {
        if (base64Image == null || base64Image.isEmpty()) {
            return false;
        }
        
        // Check if it's a data URL
        if (!BASE64_PATTERN.matcher(base64Image).matches()) {
            // If not a data URL but a URL to an image resource, consider it valid
            return base64Image.startsWith("http") || base64Image.startsWith("/");
        }
        
        // Check size
        String base64Data = base64Image.substring(base64Image.indexOf(",") + 1);
        if (base64Data.length() > MAX_BASE64_SIZE) {
            logger.warn("Base64 image exceeds maximum size of 10MB");
            return false;
        }
        
        // Verify it can be decoded
        try {
            Base64.getDecoder().decode(base64Data);
            return true;
        } catch (IllegalArgumentException e) {
            logger.error("Invalid base64 encoding: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Extracts the MIME type from a base64 encoded image
     * @param base64Image The base64 image string
     * @return The MIME type or null if not found
     */
    public static String getImageMimeType(String base64Image) {
        if (base64Image == null || !base64Image.startsWith("data:image/")) {
            return null;
        }
        
        int startIndex = "data:".length();
        int endIndex = base64Image.indexOf(";base64");
        
        if (endIndex > startIndex) {
            return base64Image.substring(startIndex, endIndex);
        }
        
        return null;
    }
} 