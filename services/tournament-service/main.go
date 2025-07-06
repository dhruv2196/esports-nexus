package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"
	"github.com/lib/pq"
	_ "github.com/lib/pq"
	"github.com/rs/cors"
)

// Tournament represents a tournament
type Tournament struct {
	ID             string    `json:"id"`
	Name           string    `json:"name"`
	GameID         string    `json:"game_id"`
	OrganizerID    string    `json:"organizer_id"`
	BracketType    string    `json:"bracket_type"`
	MaxTeams       int       `json:"max_teams"`
	CurrentTeams   int       `json:"current_teams"`
	PrizePoolCents int64     `json:"prize_pool_cents"`
	StartDate      time.Time `json:"start_date"`
	EndDate        time.Time `json:"end_date"`
	Status         string    `json:"status"`
	Rules          string    `json:"rules"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// CreateTournamentRequest represents the request to create a tournament
type CreateTournamentRequest struct {
	Name           string    `json:"name"`
	GameID         string    `json:"game_id"`
	BracketType    string    `json:"bracket_type"`
	MaxTeams       int       `json:"max_teams"`
	PrizePoolCents int64     `json:"prize_pool_cents"`
	StartDate      time.Time `json:"start_date"`
	EndDate        time.Time `json:"end_date"`
	Rules          string    `json:"rules"`
}

// Team represents a team in a tournament
type Team struct {
	ID           string         `json:"id"`
	TournamentID string         `json:"tournament_id"`
	Name         string         `json:"name"`
	CaptainID    string         `json:"captain_id"`
	Members      pq.StringArray `json:"members"`
	Seed         int            `json:"seed"`
	Status       string         `json:"status"`
	CreatedAt    time.Time      `json:"created_at"`
}

// Match represents a match in a tournament
type Match struct {
	ID           string    `json:"id"`
	TournamentID string    `json:"tournament_id"`
	Round        int       `json:"round"`
	MatchNumber  int       `json:"match_number"`
	Team1ID      string    `json:"team1_id"`
	Team2ID      string    `json:"team2_id"`
	WinnerID     string    `json:"winner_id"`
	Score        string    `json:"score"`
	Status       string    `json:"status"`
	ScheduledAt  time.Time `json:"scheduled_at"`
	StartedAt    *time.Time `json:"started_at"`
	CompletedAt  *time.Time `json:"completed_at"`
}

var db *sql.DB
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins in development
	},
}

// WebSocket clients for real-time updates
var clients = make(map[*websocket.Conn]bool)
var broadcast = make(chan interface{})

func main() {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found")
	}

	// Database connection
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "postgres"
	}
	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "5432"
	}
	dbUser := os.Getenv("DB_USERNAME")
	if dbUser == "" {
		dbUser = "postgres"
	}
	dbPassword := os.Getenv("DB_PASSWORD")
	if dbPassword == "" {
		dbPassword = "postgres"
	}
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "esports_nexus_tournaments"
	}

	psqlInfo := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPassword, dbName)

	db, err = sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	log.Println("Successfully connected to database")

	// Create tables if they don't exist
	createTables()

	// Start WebSocket broadcaster
	go handleBroadcast()

	// Setup routes
	router := mux.NewRouter()
	router.HandleFunc("/health", healthCheck).Methods("GET")
	
	// API routes
	api := router.PathPrefix("/api/v1").Subrouter()
	api.HandleFunc("/tournaments", createTournament).Methods("POST")
	api.HandleFunc("/tournaments", getTournaments).Methods("GET")
	api.HandleFunc("/tournaments/{id}", getTournament).Methods("GET")
	api.HandleFunc("/tournaments/{id}", updateTournament).Methods("PUT")
	api.HandleFunc("/tournaments/{id}", deleteTournament).Methods("DELETE")
	api.HandleFunc("/tournaments/{id}/register", registerTeam).Methods("POST")
	api.HandleFunc("/tournaments/{id}/bracket", getBracket).Methods("GET")
	api.HandleFunc("/tournaments/{id}/matches", getMatches).Methods("GET")
	api.HandleFunc("/tournaments/{id}/matches/{matchId}", updateMatch).Methods("PUT")
	
	// WebSocket endpoint
	api.HandleFunc("/tournaments/{id}/live", handleWebSocket)

	// Setup CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	handler := c.Handler(router)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Tournament service starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}

func createTables() {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS tournaments (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			name VARCHAR(255) NOT NULL,
			game_id UUID NOT NULL,
			organizer_id UUID NOT NULL,
			bracket_type VARCHAR(50) NOT NULL,
			max_teams INTEGER NOT NULL,
			current_teams INTEGER DEFAULT 0,
			prize_pool_cents BIGINT DEFAULT 0,
			start_date TIMESTAMP NOT NULL,
			end_date TIMESTAMP NOT NULL,
			status VARCHAR(50) DEFAULT 'upcoming',
			rules TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS teams (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
			name VARCHAR(255) NOT NULL,
			captain_id UUID NOT NULL,
			members TEXT[],
			seed INTEGER,
			status VARCHAR(50) DEFAULT 'registered',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS matches (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
			round INTEGER NOT NULL,
			match_number INTEGER NOT NULL,
			team1_id UUID REFERENCES teams(id),
			team2_id UUID REFERENCES teams(id),
			winner_id UUID REFERENCES teams(id),
			score VARCHAR(50),
			status VARCHAR(50) DEFAULT 'scheduled',
			scheduled_at TIMESTAMP,
			started_at TIMESTAMP,
			completed_at TIMESTAMP
		)`,
	}

	for _, query := range queries {
		_, err := db.Exec(query)
		if err != nil {
			log.Printf("Error creating table: %v", err)
		}
	}
}

func healthCheck(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"status":    "ok",
		"timestamp": time.Now().Format(time.RFC3339),
		"service":   "tournament-service",
		"version":   "1.0.0",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func createTournament(w http.ResponseWriter, r *http.Request) {
	var req CreateTournamentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Get organizer ID from auth header (simplified for now)
	organizerID := r.Header.Get("X-User-ID")
	if organizerID == "" {
		organizerID = "00000000-0000-0000-0000-000000000000" // Default for testing
	}

	tournament := Tournament{
		ID:             uuid.New().String(),
		Name:           req.Name,
		GameID:         req.GameID,
		OrganizerID:    organizerID,
		BracketType:    req.BracketType,
		MaxTeams:       req.MaxTeams,
		CurrentTeams:   0,
		PrizePoolCents: req.PrizePoolCents,
		StartDate:      req.StartDate,
		EndDate:        req.EndDate,
		Status:         "upcoming",
		Rules:          req.Rules,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	query := `INSERT INTO tournaments (id, name, game_id, organizer_id, bracket_type, max_teams, 
			  current_teams, prize_pool_cents, start_date, end_date, status, rules, created_at, updated_at)
			  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`

	_, err := db.Exec(query, tournament.ID, tournament.Name, tournament.GameID, tournament.OrganizerID,
		tournament.BracketType, tournament.MaxTeams, tournament.CurrentTeams, tournament.PrizePoolCents,
		tournament.StartDate, tournament.EndDate, tournament.Status, tournament.Rules,
		tournament.CreatedAt, tournament.UpdatedAt)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Broadcast tournament creation
	broadcast <- map[string]interface{}{
		"type":       "tournament_created",
		"tournament": tournament,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(tournament)
}

func getTournaments(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	gameID := r.URL.Query().Get("game_id")
	
	query := "SELECT id, name, game_id, organizer_id, bracket_type, max_teams, current_teams, prize_pool_cents, start_date, end_date, status, rules, created_at, updated_at FROM tournaments WHERE 1=1"
	args := []interface{}{}
	argCount := 0

	if status != "" {
		argCount++
		query += fmt.Sprintf(" AND status = $%d", argCount)
		args = append(args, status)
	}

	if gameID != "" {
		argCount++
		query += fmt.Sprintf(" AND game_id = $%d", argCount)
		args = append(args, gameID)
	}

	query += " ORDER BY created_at DESC"

	rows, err := db.Query(query, args...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	tournaments := []Tournament{}
	for rows.Next() {
		var t Tournament
		err := rows.Scan(&t.ID, &t.Name, &t.GameID, &t.OrganizerID, &t.BracketType,
			&t.MaxTeams, &t.CurrentTeams, &t.PrizePoolCents, &t.StartDate, &t.EndDate,
			&t.Status, &t.Rules, &t.CreatedAt, &t.UpdatedAt)
		if err != nil {
			log.Printf("Error scanning tournament: %v", err)
			continue
		}
		tournaments = append(tournaments, t)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tournaments)
}

func getTournament(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var t Tournament
	query := `SELECT id, name, game_id, organizer_id, bracket_type, max_teams, current_teams, 
			  prize_pool_cents, start_date, end_date, status, rules, created_at, updated_at 
			  FROM tournaments WHERE id = $1`

	err := db.QueryRow(query, id).Scan(&t.ID, &t.Name, &t.GameID, &t.OrganizerID,
		&t.BracketType, &t.MaxTeams, &t.CurrentTeams, &t.PrizePoolCents,
		&t.StartDate, &t.EndDate, &t.Status, &t.Rules, &t.CreatedAt, &t.UpdatedAt)

	if err == sql.ErrNoRows {
		http.Error(w, "Tournament not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(t)
}

func updateTournament(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var req CreateTournamentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	query := `UPDATE tournaments SET name = $1, bracket_type = $2, max_teams = $3, 
			  prize_pool_cents = $4, start_date = $5, end_date = $6, rules = $7, 
			  updated_at = $8 WHERE id = $9`

	_, err := db.Exec(query, req.Name, req.BracketType, req.MaxTeams,
		req.PrizePoolCents, req.StartDate, req.EndDate, req.Rules,
		time.Now(), id)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Broadcast tournament update
	broadcast <- map[string]interface{}{
		"type":         "tournament_updated",
		"tournament_id": id,
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Tournament updated successfully"})
}

func deleteTournament(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	_, err := db.Exec("DELETE FROM tournaments WHERE id = $1", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func registerTeam(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	tournamentID := vars["id"]

	var team struct {
		Name    string   `json:"name"`
		Members []string `json:"members"`
	}

	if err := json.NewDecoder(r.Body).Decode(&team); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Get captain ID from auth header
	captainID := r.Header.Get("X-User-ID")
	if captainID == "" {
		captainID = "00000000-0000-0000-0000-000000000000" // Default for testing
	}

	// Check if tournament has space
	var currentTeams, maxTeams int
	err := db.QueryRow("SELECT current_teams, max_teams FROM tournaments WHERE id = $1", tournamentID).
		Scan(&currentTeams, &maxTeams)
	if err != nil {
		http.Error(w, "Tournament not found", http.StatusNotFound)
		return
	}

	if currentTeams >= maxTeams {
		http.Error(w, "Tournament is full", http.StatusBadRequest)
		return
	}

	// Create team
	teamID := uuid.New().String()
	_, err = db.Exec(`INSERT INTO teams (id, tournament_id, name, captain_id, members, seed, status)
					  VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		teamID, tournamentID, team.Name, captainID, pq.Array(team.Members), currentTeams+1, "registered")

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Update tournament team count
	_, err = db.Exec("UPDATE tournaments SET current_teams = current_teams + 1 WHERE id = $1", tournamentID)
	if err != nil {
		log.Printf("Error updating team count: %v", err)
	}

	// Broadcast team registration
	broadcast <- map[string]interface{}{
		"type":          "team_registered",
		"tournament_id": tournamentID,
		"team_id":       teamID,
		"team_name":     team.Name,
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"team_id": teamID,
		"message": "Team registered successfully",
	})
}

func getBracket(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	tournamentID := vars["id"]

	// Get all matches for the tournament
	rows, err := db.Query(`SELECT id, round, match_number, team1_id, team2_id, winner_id, score, status
						   FROM matches WHERE tournament_id = $1 ORDER BY round, match_number`, tournamentID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	matches := []Match{}
	for rows.Next() {
		var m Match
		err := rows.Scan(&m.ID, &m.Round, &m.MatchNumber, &m.Team1ID, &m.Team2ID,
			&m.WinnerID, &m.Score, &m.Status)
		if err != nil {
			log.Printf("Error scanning match: %v", err)
			continue
		}
		m.TournamentID = tournamentID
		matches = append(matches, m)
	}

	// Group matches by round for bracket visualization
	bracket := make(map[int][]Match)
	for _, match := range matches {
		bracket[match.Round] = append(bracket[match.Round], match)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(bracket)
}

func getMatches(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	tournamentID := vars["id"]

	rows, err := db.Query(`SELECT id, round, match_number, team1_id, team2_id, winner_id, 
						   score, status, scheduled_at, started_at, completed_at
						   FROM matches WHERE tournament_id = $1 ORDER BY round, match_number`, tournamentID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	matches := []Match{}
	for rows.Next() {
		var m Match
		err := rows.Scan(&m.ID, &m.Round, &m.MatchNumber, &m.Team1ID, &m.Team2ID,
			&m.WinnerID, &m.Score, &m.Status, &m.ScheduledAt, &m.StartedAt, &m.CompletedAt)
		if err != nil {
			log.Printf("Error scanning match: %v", err)
			continue
		}
		m.TournamentID = tournamentID
		matches = append(matches, m)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(matches)
}

func updateMatch(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	matchID := vars["matchId"]

	var update struct {
		WinnerID string `json:"winner_id"`
		Score    string `json:"score"`
		Status   string `json:"status"`
	}

	if err := json.NewDecoder(r.Body).Decode(&update); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	query := "UPDATE matches SET winner_id = $1, score = $2, status = $3"
	args := []interface{}{update.WinnerID, update.Score, update.Status}

	if update.Status == "in_progress" {
		query += ", started_at = $4"
		args = append(args, time.Now())
	} else if update.Status == "completed" {
		query += ", completed_at = $4"
		args = append(args, time.Now())
	}

	query += fmt.Sprintf(" WHERE id = $%d", len(args)+1)
	args = append(args, matchID)

	_, err := db.Exec(query, args...)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Broadcast match update
	broadcast <- map[string]interface{}{
		"type":     "match_updated",
		"match_id": matchID,
		"status":   update.Status,
		"winner":   update.WinnerID,
		"score":    update.Score,
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Match updated successfully"})
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}
	defer conn.Close()

	clients[conn] = true

	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			delete(clients, conn)
			break
		}
	}
}

func handleBroadcast() {
	for {
		msg := <-broadcast
		for client := range clients {
			err := client.WriteJSON(msg)
			if err != nil {
				client.Close()
				delete(clients, client)
			}
		}
	}
}