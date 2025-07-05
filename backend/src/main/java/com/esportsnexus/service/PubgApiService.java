package com.esportsnexus.service;

import com.esportsnexus.dto.pubg.*;
import com.esportsnexus.model.User;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class PubgApiService {
    
    private static final String BASE_URL = "https://api.pubg.com/shards";
    private static final String PLATFORM_SHARD = "pc-sea"; // Using PC Southeast Asia shard
    
    @Value("${pubg.api.key:}")
    private String apiKey;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    public PubgApiService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * Search for players by their in-game names
     */
    @Cacheable(value = "pubgPlayers", key = "#playerNames.toString()")
    public List<PubgPlayerDto> searchPlayers(List<String> playerNames) {
        try {
            // Build URL manually to avoid double encoding
            String url = BASE_URL + "/" + PLATFORM_SHARD + "/players?filter[playerNames]=" + 
                        String.join(",", playerNames);
            
            HttpHeaders headers = createHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class
            );
            
            return parsePlayersResponse(response.getBody());
        } catch (Exception e) {
            log.error("Error searching for players: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
    
    /**
     * Get player by ID
     */
    @Cacheable(value = "pubgPlayer", key = "#playerId")
    public PubgPlayerDto getPlayer(String playerId) {
        try {
            String url = BASE_URL + "/" + PLATFORM_SHARD + "/players/" + playerId;
            
            HttpHeaders headers = createHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class
            );
            
            return parsePlayerResponse(response.getBody());
        } catch (Exception e) {
            log.error("Error getting player: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * Get player's season stats
     */
    @Cacheable(value = "pubgSeasonStats", key = "#playerId + '_' + #seasonId")
    public PubgSeasonStatsDto getPlayerSeasonStats(String playerId, String seasonId) {
        try {
            String url = BASE_URL + "/" + PLATFORM_SHARD + "/players/" + playerId + 
                        "/seasons/" + seasonId;
            
            HttpHeaders headers = createHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class
            );
            
            return parseSeasonStatsResponse(response.getBody());
        } catch (Exception e) {
            log.error("Error getting season stats: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * Get player's lifetime stats
     */
    @Cacheable(value = "pubgLifetimeStats", key = "#playerId")
    public PubgLifetimeStatsDto getPlayerLifetimeStats(String playerId) {
        try {
            String url = BASE_URL + "/" + PLATFORM_SHARD + "/players/" + playerId + 
                        "/seasons/lifetime";
            
            HttpHeaders headers = createHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class
            );
            
            return parseLifetimeStatsResponse(response.getBody());
        } catch (Exception e) {
            log.error("Error getting lifetime stats: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * Get match details
     */
    @Cacheable(value = "pubgMatch", key = "#matchId")
    public PubgMatchDto getMatch(String matchId) {
        try {
            String url = BASE_URL + "/" + PLATFORM_SHARD + "/matches/" + matchId;
            
            HttpHeaders headers = createHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class
            );
            
            return parseMatchResponse(response.getBody());
        } catch (Exception e) {
            log.error("Error getting match: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * Get current season ID
     */
    @Cacheable(value = "pubgCurrentSeason")
    public String getCurrentSeasonId() {
        try {
            String url = BASE_URL + "/" + PLATFORM_SHARD + "/seasons";
            
            HttpHeaders headers = createHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class
            );
            
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode data = root.get("data");
            
            // Find the current season
            for (JsonNode season : data) {
                JsonNode attributes = season.get("attributes");
                if (attributes.get("isCurrentSeason").asBoolean()) {
                    return season.get("id").asText();
                }
            }
            
            return null;
        } catch (Exception e) {
            log.error("Error getting current season: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * Convert PUBG stats to our GameStats model
     */
    public User.GameStats convertToGameStats(PubgLifetimeStatsDto lifetimeStats, String gameMode) {
        if (lifetimeStats == null || lifetimeStats.getGameModeStats() == null) {
            return new User.GameStats();
        }
        
        Map<String, Object> stats = lifetimeStats.getGameModeStats().get(gameMode);
        if (stats == null) {
            stats = lifetimeStats.getGameModeStats().get("squad-fpp"); // Default to squad-fpp
        }
        
        if (stats == null) {
            return new User.GameStats();
        }
        
        User.GameStats gameStats = new User.GameStats();
        gameStats.setMatchesPlayed(getIntValue(stats, "roundsPlayed"));
        gameStats.setWins(getIntValue(stats, "wins"));
        gameStats.setKills(getIntValue(stats, "kills"));
        gameStats.setDeaths(getIntValue(stats, "losses"));
        
        // Calculate K/D ratio
        int deaths = gameStats.getDeaths() > 0 ? gameStats.getDeaths() : 1;
        gameStats.setKd((double) gameStats.getKills() / deaths);
        
        // Calculate win rate
        int matches = gameStats.getMatchesPlayed() > 0 ? gameStats.getMatchesPlayed() : 1;
        gameStats.setWinRate((double) gameStats.getWins() / matches * 100);
        
        // Additional stats
        gameStats.setRank(stats.get("rankPointsTitle") != null ? 
            stats.get("rankPointsTitle").toString() : "Unranked");
        
        return gameStats;
    }
    
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        headers.set("Authorization", "Bearer " + apiKey);
        return headers;
    }
    
    private List<PubgPlayerDto> parsePlayersResponse(String json) {
        try {
            // The PUBG API returns malformed JSON with missing commas
            // We need to fix it before parsing
            String fixedJson = fixMalformedJson(json);
            log.debug("Fixed JSON: {}", fixedJson);
            
            JsonNode root = objectMapper.readTree(fixedJson);
            JsonNode data = root.get("data");
            
            if (data == null || !data.isArray()) {
                log.warn("No data array found in response");
                return Collections.emptyList();
            }
            
            List<PubgPlayerDto> players = new ArrayList<>();
            for (JsonNode playerNode : data) {
                PubgPlayerDto player = new PubgPlayerDto();
                
                // Get player ID
                if (playerNode.has("id")) {
                    player.setId(playerNode.get("id").asText());
                }
                
                // Get attributes
                JsonNode attributes = playerNode.get("attributes");
                if (attributes != null) {
                    if (attributes.has("name")) {
                        player.setName(attributes.get("name").asText());
                    }
                    if (attributes.has("shardId")) {
                        player.setShardId(attributes.get("shardId").asText());
                    }
                }
                
                // Parse match IDs
                JsonNode relationships = playerNode.get("relationships");
                if (relationships != null && relationships.has("matches")) {
                    JsonNode matches = relationships.get("matches").get("data");
                    if (matches != null && matches.isArray()) {
                        List<String> matchIds = new ArrayList<>();
                        for (JsonNode match : matches) {
                            if (match.has("id")) {
                                matchIds.add(match.get("id").asText());
                            }
                        }
                        player.setMatchIds(matchIds);
                    }
                }
                
                // Only add player if we have at least an ID
                if (player.getId() != null) {
                    players.add(player);
                }
            }
            
            log.info("Parsed {} players from response", players.size());
            return players;
        } catch (Exception e) {
            log.error("Error parsing players response: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }
    
    /**
     * Fix malformed JSON from PUBG API by adding missing commas
     */
    private String fixMalformedJson(String json) {
        // Add commas after closing quotes that are followed by opening quotes
        json = json.replaceAll("\"(\\s*)\"", "\",\"");
        // Add commas after closing braces/brackets that are followed by opening quotes
        json = json.replaceAll("\\}(\\s*)\"", "},\"");
        json = json.replaceAll("\\](\\s*)\"", "],\"");
        // Add commas after closing quotes that are followed by opening braces/brackets
        json = json.replaceAll("\"(\\s*)\\{", "\",{");
        json = json.replaceAll("\"(\\s*)\\[", "\",[");
        return json;
    }
    
    private PubgPlayerDto parsePlayerResponse(String json) {
        try {
            List<PubgPlayerDto> players = parsePlayersResponse(json);
            return players.isEmpty() ? null : players.get(0);
        } catch (Exception e) {
            log.error("Error parsing player response: {}", e.getMessage());
            return null;
        }
    }
    
    private PubgSeasonStatsDto parseSeasonStatsResponse(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode data = root.get("data");
            JsonNode attributes = data.get("attributes");
            
            PubgSeasonStatsDto stats = new PubgSeasonStatsDto();
            stats.setSeasonId(data.get("id").asText());
            
            // Parse game mode stats
            JsonNode gameModeStats = attributes.get("gameModeStats");
            Map<String, Map<String, Object>> modeStats = new HashMap<>();
            
            Iterator<String> modes = gameModeStats.fieldNames();
            while (modes.hasNext()) {
                String mode = modes.next();
                JsonNode modeNode = gameModeStats.get(mode);
                Map<String, Object> statsMap = objectMapper.convertValue(modeNode, Map.class);
                modeStats.put(mode, statsMap);
            }
            
            stats.setGameModeStats(modeStats);
            return stats;
        } catch (Exception e) {
            log.error("Error parsing season stats response: {}", e.getMessage());
            return null;
        }
    }
    
    private PubgLifetimeStatsDto parseLifetimeStatsResponse(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode data = root.get("data");
            JsonNode attributes = data.get("attributes");
            
            PubgLifetimeStatsDto stats = new PubgLifetimeStatsDto();
            stats.setSeasonId(data.get("id").asText());
            
            // Parse game mode stats
            JsonNode gameModeStats = attributes.get("gameModeStats");
            Map<String, Map<String, Object>> modeStats = new HashMap<>();
            
            Iterator<String> modes = gameModeStats.fieldNames();
            while (modes.hasNext()) {
                String mode = modes.next();
                JsonNode modeNode = gameModeStats.get(mode);
                Map<String, Object> statsMap = objectMapper.convertValue(modeNode, Map.class);
                modeStats.put(mode, statsMap);
            }
            
            stats.setGameModeStats(modeStats);
            return stats;
        } catch (Exception e) {
            log.error("Error parsing lifetime stats response: {}", e.getMessage());
            return null;
        }
    }
    
    private PubgMatchDto parseMatchResponse(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode data = root.get("data");
            JsonNode attributes = data.get("attributes");
            
            PubgMatchDto match = new PubgMatchDto();
            match.setId(data.get("id").asText());
            match.setCreatedAt(attributes.get("createdAt").asText());
            match.setDuration(attributes.get("duration").asInt());
            match.setGameMode(attributes.get("gameMode").asText());
            match.setMapName(attributes.get("mapName").asText());
            match.setMatchType(attributes.get("matchType").asText());
            
            // Parse participants
            JsonNode included = root.get("included");
            List<PubgParticipantDto> participants = new ArrayList<>();
            
            for (JsonNode node : included) {
                if ("participant".equals(node.get("type").asText())) {
                    JsonNode stats = node.get("attributes").get("stats");
                    
                    PubgParticipantDto participant = new PubgParticipantDto();
                    participant.setId(node.get("id").asText());
                    participant.setName(stats.get("name").asText());
                    participant.setPlayerId(stats.get("playerId").asText());
                    participant.setKills(stats.get("kills").asInt());
                    participant.setDamageDealt(stats.get("damageDealt").asDouble());
                    participant.setWinPlace(stats.get("winPlace").asInt());
                    participant.setTimeSurvived(stats.get("timeSurvived").asDouble());
                    
                    participants.add(participant);
                }
            }
            
            match.setParticipants(participants);
            return match;
        } catch (Exception e) {
            log.error("Error parsing match response: {}", e.getMessage());
            return null;
        }
    }
    
    private int getIntValue(Map<String, Object> stats, String key) {
        Object value = stats.get(key);
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return 0;
    }
}