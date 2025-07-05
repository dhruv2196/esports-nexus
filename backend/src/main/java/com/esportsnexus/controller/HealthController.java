package com.esportsnexus.controller;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/health")
public class HealthController {
    
    @GetMapping
    public Map<String, String> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Backend is running");
        return response;
    }
    
    @PostMapping("/test")
    public Map<String, String> testPost(@RequestBody Map<String, String> body) {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("received", body.toString());
        return response;
    }
}