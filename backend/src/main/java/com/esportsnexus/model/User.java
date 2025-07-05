package com.esportsnexus.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String username;
    
    @Indexed(unique = true)
    private String email;
    
    private String password;
    
    private String avatar;
    private String bio;
    private String displayName;
    
    // Gaming profiles
    private Map<String, String> gamingIds; // e.g., {"bgmi": "playerID123"}
    
    // Stats
    private Map<String, GameStats> gameStats; // Stats per game
    
    // Social
    private Set<String> friends = new HashSet<>();
    private Set<String> teamIds = new HashSet<>();
    
    // Preferences
    private List<String> favoriteGames;
    private NotificationSettings notificationSettings;
    
    // Auth
    private String provider; // local, google, discord
    private String providerId;
    private Set<String> roles = new HashSet<>();
    private boolean enabled = true;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GameStats {
        private int matchesPlayed;
        private int wins;
        private int kills;
        private int deaths;
        private double kd;
        private double winRate;
        private String rank;
        private int level;
        private Map<String, Object> additionalStats;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationSettings {
        private boolean matchInvites = true;
        private boolean tournamentUpdates = true;
        private boolean friendRequests = true;
        private boolean teamInvites = true;
        private boolean liveMatches = true;
    }
}