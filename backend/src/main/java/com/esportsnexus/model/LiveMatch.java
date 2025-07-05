package com.esportsnexus.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "live_matches")
public class LiveMatch {
    @Id
    private String id;
    
    private String title;
    private String game;
    private String tournamentId;
    private String description;
    
    // Stream details
    private String streamUrl;
    private StreamPlatform platform;
    private String streamerId;
    private String thumbnailUrl;
    
    // Match details
    private MatchStatus status;
    private LocalDateTime scheduledTime;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    
    // Participants
    private List<String> teamIds;
    private List<String> playerIds;
    
    // Live data
    private int viewerCount;
    private Map<String, Object> liveStats;
    private List<String> highlights;
    
    // Chat
    private boolean chatEnabled;
    private String chatRoomId;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    public enum StreamPlatform {
        YOUTUBE, TWITCH, FACEBOOK, CUSTOM
    }
    
    public enum MatchStatus {
        SCHEDULED, LIVE, COMPLETED, CANCELLED
    }
}