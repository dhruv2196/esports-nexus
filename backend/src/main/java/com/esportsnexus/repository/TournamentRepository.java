package com.esportsnexus.repository;

import com.esportsnexus.model.Tournament;
import com.esportsnexus.model.Tournament.TournamentStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TournamentRepository extends MongoRepository<Tournament, String> {
    List<Tournament> findByStatus(TournamentStatus status);
    List<Tournament> findByGame(String game);
    List<Tournament> findByGameAndStatus(String game, TournamentStatus status);
    List<Tournament> findByOrganizerId(String organizerId);
    List<Tournament> findByStartDateBetween(LocalDateTime start, LocalDateTime end);
    List<Tournament> findByRegisteredTeamIdsContaining(String teamId);
}