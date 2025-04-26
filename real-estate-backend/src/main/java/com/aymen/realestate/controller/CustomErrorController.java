package com.aymen.realestate.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;

@RestController
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public ResponseEntity<String> handleError(HttpServletRequest request) {
        Integer statusCode = (Integer) request.getAttribute("javax.servlet.error.status_code");
        Exception exception = (Exception) request.getAttribute("javax.servlet.error.exception");
        
        String message = "An error occurred";
        if (statusCode != null) {
            if (statusCode == HttpStatus.NOT_FOUND.value()) {
                message = "The requested resource was not found. Please check the URL and try again.";
            } else if (statusCode == HttpStatus.INTERNAL_SERVER_ERROR.value()) {
                message = "An internal server error occurred. Please try again later.";
            }
        }
        
        HttpStatus httpStatus = statusCode != null ? HttpStatus.valueOf(statusCode) : HttpStatus.INTERNAL_SERVER_ERROR;
        
        return ResponseEntity.status(httpStatus)
                .body(message + "\n\nAvailable endpoints:\n" +
                      "- GET /api/listings/get - Get all listings\n" +
                      "- GET /api/listings/get/{id} - Get a specific listing\n" +
                      "- POST /api/listings/create - Create a new listing\n" +
                      "- PUT /api/listings/update/{id} - Update a listing\n" +
                      "- DELETE /api/listings/delete/{id} - Delete a listing\n" +
                      "- PUT /api/listings/status/{id} - Update a listing's status\n" +
                      "- GET /api/listings/test - Test endpoint");
    }
} 