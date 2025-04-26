package com.aymen.realestate.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "Real Estate Marketplace API is running!<br>" +
               "Available endpoints:<br>" +
               "- GET /api/listings/get - Get all listings<br>" +
               "- GET /api/listings/get/{id} - Get a specific listing<br>" +
               "- POST /api/listings/create - Create a new listing<br>" +
               "- PUT /api/listings/update/{id} - Update a listing<br>" +
               "- DELETE /api/listings/delete/{id} - Delete a listing<br>" +
               "- PUT /api/listings/status/{id} - Update a listing's status<br>" +
               "- GET /api/listings/test - Test endpoint";
    }
} 