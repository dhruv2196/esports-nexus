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
import java.util.Set;
import java.util.HashSet;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "teams")
public class Team {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String name;
    
    private String tag; // Short tag like "TSM", "FNC"
    private String logo;
    private String banner;
    private String description;
    
    // Team management
    private String captainId;
    private Set<String> memberIds = new HashSet<>();
    private Set<String> coachIds = new HashSet<>();
    private int maxMembers;
    
    // Game focus
    private List<String> games;
    private String primaryGame;
    
    // Recruitment
    private boolean recruiting;
    private List<String> lookingForRoles;
    private String recruitmentMessage;
    private List<String> requiredSkillTags;
    
    // Stats
    private TeamStats stats;
    
    // Tournament participation
    private Set<String> tournamentIds = new HashSet<>();
    private List<Achievement> achievements;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamStats {
        private int tournamentsPlayed;
        private int tournamentsWon;
        private int matchesPlayed;
        private int matchesWon;
        private double winRate;
        private int currentRanking;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Achievement {
        private String title;
        private String description;
        private String tournamentId;
        private int placement;
        private LocalDateTime achievedDate;
    }
}