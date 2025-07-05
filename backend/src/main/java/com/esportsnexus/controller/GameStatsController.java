package com.esportsnexus.controller;

import com.esportsnexus.dto.ApiResponse;
import com.esportsnexus.dto.pubg.*;
import com.esportsnexus.model.User;
import com.esportsnexus.repository.UserRepository;
import com.esportsnexus.security.CurrentUser;
import com.esportsnexus.security.UserPrincipal;
import com.esportsnexus.service.PubgApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Slf4j
@RestController
@RequestMapping("/game-stats")
@RequiredArgsConstructor
public class GameStatsController {
    
    private final PubgApiService pubgApiService;
    private final UserRepository userRepository;
    
    /**
     * Search for BGMI/PUBG players by name
     */
    @GetMapping("/bgmi/search")
    public ResponseEntity<?> searchBgmiPlayers(@RequestParam String playerName) {
        try {
            List<PubgPlayerDto> players = pubgApiService.searchPlayers(
                Collections.singletonList(playerName)
            );
            
            if (players.isEmpty()) {
                return ResponseEntity.ok(new ApiResponse(false, "No players found"));
            }
            
            return ResponseEntity.ok(new ApiResponse(true, "Players found", players));
        } catch (Exception e) {
            log.error("Error searching BGMI players: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, "Error searching players"));
        }
    }
    
    /**
     * Get BGMI/PUBG player stats
     */
    @GetMapping("/bgmi/player/{playerId}")
    public ResponseEntity<?> getBgmiPlayerStats(@PathVariable String playerId) {
        try {
            // Get player info
            PubgPlayerDto player = pubgApiService.getPlayer(playerId);
            if (player == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Get lifetime stats
            PubgLifetimeStatsDto lifetimeStats = pubgApiService.getPlayerLifetimeStats(playerId);
            
            // Get current season stats
            String currentSeasonId = pubgApiService.getCurrentSeasonId();
            PubgSeasonStatsDto seasonStats = null;
            if (currentSeasonId != null) {
                seasonStats = pubgApiService.getPlayerSeasonStats(playerId, currentSeasonId);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("player", player);
            response.put("lifetimeStats", lifetimeStats);
            response.put("currentSeasonStats", seasonStats);
            response.put("currentSeasonId", currentSeasonId);
            
            return ResponseEntity.ok(new ApiResponse(true, "Player stats retrieved", response));
        } catch (Exception e) {
            log.error("Error getting BGMI player stats: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, "Error getting player stats"));
        }
    }
    
    /**
     * Link BGMI/PUBG account to user profile
     */
    @PostMapping("/bgmi/link")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> linkBgmiAccount(
            @CurrentUser UserPrincipal currentUser,
            @RequestBody Map<String, String> request) {
        try {
            String playerName = request.get("playerName");
            if (playerName == null || playerName.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Player name is required"));
            }
            
            // Search for the player
            List<PubgPlayerDto> players = pubgApiService.searchPlayers(
                Collections.singletonList(playerName)
            );
            
            if (players.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, "Player not found"));
            }
            
            PubgPlayerDto bgmiPlayer = players.get(0);
            
            // Update user's gaming IDs
            User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (user.getGamingIds() == null) {
                user.setGamingIds(new HashMap<>());
            }
            user.getGamingIds().put("bgmi", bgmiPlayer.getId());
            user.getGamingIds().put("bgmiName", bgmiPlayer.getName());
            
            // Fetch and store stats
            PubgLifetimeStatsDto lifetimeStats = pubgApiService.getPlayerLifetimeStats(bgmiPlayer.getId());
            if (lifetimeStats != null) {
                User.GameStats gameStats = pubgApiService.convertToGameStats(lifetimeStats, "squad-fpp");
                if (user.getGameStats() == null) {
                    user.setGameStats(new HashMap<>());
                }
                user.getGameStats().put("bgmi", gameStats);
            }
            
            userRepository.save(user);
            
            return ResponseEntity.ok(new ApiResponse(true, "BGMI account linked successfully", bgmiPlayer));
        } catch (Exception e) {
            log.error("Error linking BGMI account: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, "Error linking BGMI account"));
        }
    }
    
    /**
     * Get user's BGMI stats
     */
    @GetMapping("/bgmi/my-stats")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getMyBgmiStats(@CurrentUser UserPrincipal currentUser) {
        try {
            User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (user.getGamingIds() == null || !user.getGamingIds().containsKey("bgmi")) {
                return ResponseEntity.ok(new ApiResponse(false, "BGMI account not linked"));
            }
            
            String bgmiPlayerId = user.getGamingIds().get("bgmi");
            
            // Get fresh stats
            PubgLifetimeStatsDto lifetimeStats = pubgApiService.getPlayerLifetimeStats(bgmiPlayerId);
            String currentSeasonId = pubgApiService.getCurrentSeasonId();
            PubgSeasonStatsDto seasonStats = null;
            if (currentSeasonId != null) {
                seasonStats = pubgApiService.getPlayerSeasonStats(bgmiPlayerId, currentSeasonId);
            }
            
            // Update stored stats
            if (lifetimeStats != null) {
                User.GameStats gameStats = pubgApiService.convertToGameStats(lifetimeStats, "squad-fpp");
                user.getGameStats().put("bgmi", gameStats);
                userRepository.save(user);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("playerId", bgmiPlayerId);
            response.put("playerName", user.getGamingIds().get("bgmiName"));
            response.put("lifetimeStats", lifetimeStats);
            response.put("currentSeasonStats", seasonStats);
            response.put("gameStats", user.getGameStats().get("bgmi"));
            
            return ResponseEntity.ok(new ApiResponse(true, "Stats retrieved", response));
        } catch (Exception e) {
            log.error("Error getting user's BGMI stats: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, "Error getting stats"));
        }
    }
    
    /**
     * Get match details
     */
    @GetMapping("/bgmi/match/{matchId}")
    public ResponseEntity<?> getBgmiMatch(@PathVariable String matchId) {
        try {
            PubgMatchDto match = pubgApiService.getMatch(matchId);
            if (match == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(new ApiResponse(true, "Match retrieved", match));
        } catch (Exception e) {
            log.error("Error getting BGMI match: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, "Error getting match"));
        }
    }
    
    /**
     * Get recent matches for a player
     */
    @GetMapping("/bgmi/player/{playerId}/matches")
    public ResponseEntity<?> getPlayerMatches(
            @PathVariable String playerId,
            @RequestParam(defaultValue = "5") int limit) {
        try {
            PubgPlayerDto player = pubgApiService.getPlayer(playerId);
            if (player == null) {
                return ResponseEntity.notFound().build();
            }
            
            List<String> matchIds = player.getMatchIds();
            if (matchIds == null || matchIds.isEmpty()) {
                return ResponseEntity.ok(new ApiResponse(true, "No matches found", Collections.emptyList()));
            }
            
            // Get recent matches (limited)
            List<PubgMatchDto> matches = new ArrayList<>();
            int count = Math.min(limit, matchIds.size());
            for (int i = 0; i < count; i++) {
                PubgMatchDto match = pubgApiService.getMatch(matchIds.get(i));
                if (match != null) {
                    matches.add(match);
                }
            }
            
            return ResponseEntity.ok(new ApiResponse(true, "Matches retrieved", matches));
        } catch (Exception e) {
            log.error("Error getting player matches: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(new ApiResponse(false, "Error getting matches"));
        }
    }
}