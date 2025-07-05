package com.esportsnexus.controller;

import com.esportsnexus.dto.ApiResponse;
import com.esportsnexus.model.Tournament;
import com.esportsnexus.model.Tournament.TournamentStatus;
import com.esportsnexus.repository.TournamentRepository;
import com.esportsnexus.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/tournaments")
public class TournamentController {
    
    @Autowired
    private TournamentRepository tournamentRepository;
    
    @GetMapping
    public ResponseEntity<List<Tournament>> getAllTournaments(
            @RequestParam(required = false) String game,
            @RequestParam(required = false) TournamentStatus status) {
        
        List<Tournament> tournaments;
        if (game != null && status != null) {
            tournaments = tournamentRepository.findByGameAndStatus(game, status);
        } else if (game != null) {
            tournaments = tournamentRepository.findByGame(game);
        } else if (status != null) {
            tournaments = tournamentRepository.findByStatus(status);
        } else {
            tournaments = tournamentRepository.findAll();
        }
        
        return ResponseEntity.ok(tournaments);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getTournamentById(@PathVariable String id) {
        return tournamentRepository.findById(id)
                .map(tournament -> ResponseEntity.ok(tournament))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createTournament(
            @RequestBody Tournament tournament,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        tournament.setOrganizerId(currentUser.getId());
        tournament.setStatus(TournamentStatus.UPCOMING);
        
        Tournament savedTournament = tournamentRepository.save(tournament);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTournament);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> updateTournament(
            @PathVariable String id,
            @RequestBody Tournament tournamentUpdate,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        return tournamentRepository.findById(id)
                .map(tournament -> {
                    if (!tournament.getOrganizerId().equals(currentUser.getId())) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(new ApiResponse(false, "You don't have permission to update this tournament"));
                    }
                    
                    // Update fields
                    tournament.setName(tournamentUpdate.getName());
                    tournament.setDescription(tournamentUpdate.getDescription());
                    tournament.setRules(tournamentUpdate.getRules());
                    tournament.setMaxTeams(tournamentUpdate.getMaxTeams());
                    tournament.setPrizePool(tournamentUpdate.getPrizePool());
                    
                    Tournament updated = tournamentRepository.save(tournament);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/{id}/register")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> registerForTournament(
            @PathVariable String id,
            @RequestParam String teamId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        return tournamentRepository.findById(id)
                .map(tournament -> {
                    if (tournament.getStatus() != TournamentStatus.REGISTRATION_OPEN) {
                        return ResponseEntity.badRequest()
                                .body(new ApiResponse(false, "Registration is not open for this tournament"));
                    }
                    
                    if (tournament.getRegisteredTeamIds().size() >= tournament.getMaxTeams()) {
                        return ResponseEntity.badRequest()
                                .body(new ApiResponse(false, "Tournament is full"));
                    }
                    
                    if (tournament.getRegisteredTeamIds().contains(teamId)) {
                        return ResponseEntity.badRequest()
                                .body(new ApiResponse(false, "Team is already registered"));
                    }
                    
                    tournament.getRegisteredTeamIds().add(teamId);
                    Tournament updated = tournamentRepository.save(tournament);
                    
                    return ResponseEntity.ok(new ApiResponse(true, "Successfully registered for tournament"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/upcoming")
    public ResponseEntity<List<Tournament>> getUpcomingTournaments() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneMonthLater = now.plusMonths(1);
        
        List<Tournament> tournaments = tournamentRepository.findByStartDateBetween(now, oneMonthLater);
        return ResponseEntity.ok(tournaments);
    }
    
    @GetMapping("/my-tournaments")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<Tournament>> getMyTournaments(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<Tournament> tournaments = tournamentRepository.findByOrganizerId(currentUser.getId());
        return ResponseEntity.ok(tournaments);
    }
}