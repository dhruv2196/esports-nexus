package com.esportsnexus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ApiResponse {
    private Boolean success;
    private String message;
    private Object data;
    
    public ApiResponse(Boolean success, String message) {
        this.success = success;
        this.message = message;
    }
}