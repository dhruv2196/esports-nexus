package com.esportsnexus.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tournaments")
public class Tournament {
    @Id
    private String id;
    
    private String name;
    private String description;
    private String game; // e.g., "bgmi"
    private String organizerId;
    private String bannerImage;
    
    // Tournament details
    private TournamentType type;
    private TournamentStatus status;
    private int maxTeams;
    private int teamSize;
    private List<String> registeredTeamIds;
    
    // Schedule
    private LocalDateTime registrationStartDate;
    private LocalDateTime registrationEndDate;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    
    // Rules and format
    private String rules;
    private String format; // e.g., "Battle Royale", "TDM"
    private List<Round> rounds;
    
    // Prize pool
    private PrizePool prizePool;
    
    // Results
    private List<String> winnerTeamIds;
    private Map<String, Integer> teamRankings;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    public enum TournamentType {
        SOLO, DUO, SQUAD, CUSTOM
    }
    
    public enum TournamentStatus {
        UPCOMING, REGISTRATION_OPEN, REGISTRATION_CLOSED, 
        ONGOING, COMPLETED, CANCELLED
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Round {
        private String name;
        private int roundNumber;
        private LocalDateTime scheduledTime;
        private List<Match> matches;
        private boolean completed;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Match {
        private String matchId;
        private List<String> teamIds;
        private Map<String, Integer> scores;
        private String winnerId;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String streamUrl;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PrizePool {
        private double totalAmount;
        private String currency;
        private Map<Integer, Double> distribution; // rank -> prize amount
        private List<String> additionalPrizes;
    }
}