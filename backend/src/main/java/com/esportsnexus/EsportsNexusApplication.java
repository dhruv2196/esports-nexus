package com.esportsnexus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class EsportsNexusApplication {
    public static void main(String[] args) {
        SpringApplication.run(EsportsNexusApplication.class, args);
    }
}