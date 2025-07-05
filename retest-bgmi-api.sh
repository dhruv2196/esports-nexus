#!/bin/bash

echo "=========================================="
echo "BGMI/PUBG Player Search API Retest"
echo "Date: $(date)"
echo "=========================================="
echo ""

BASE_URL="http://localhost:8080/api/game-stats/bgmi"

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test API endpoint
test_endpoint() {
    local endpoint=$1
    local description=$2
    local expected_success=$3
    
    echo -e "${YELLOW}Testing: $description${NC}"
    echo "Endpoint: $endpoint"
    
    response=$(curl -s -X GET "$endpoint" -H "Accept: application/json")
    http_code=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$endpoint" -H "Accept: application/json")
    
    echo "HTTP Status: $http_code"
    echo "Response: $response"
    
    # Check if response is valid JSON
    if echo "$response" | jq . >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Valid JSON response${NC}"
        
        # Check success field
        success=$(echo "$response" | jq -r '.success')
        if [ "$success" = "$expected_success" ]; then
            echo -e "${GREEN}✓ Success field matches expected: $expected_success${NC}"
        else
            echo -e "${RED}✗ Success field mismatch. Expected: $expected_success, Got: $success${NC}"
        fi
    else
        echo -e "${RED}✗ Invalid JSON response${NC}"
    fi
    
    echo "----------------------------------------"
    echo ""
}

# Test 1: Search for existing player (luke12)
test_endpoint "${BASE_URL}/search?playerName=luke12" \
    "Search for existing player 'luke12'" \
    "true"

# Test 2: Search for another existing player (Nourinz)
test_endpoint "${BASE_URL}/search?playerName=Nourinz" \
    "Search for existing player 'Nourinz'" \
    "true"

# Test 3: Search for non-existent player
test_endpoint "${BASE_URL}/search?playerName=ThisPlayerDoesNotExist999" \
    "Search for non-existent player" \
    "false"

# Test 4: Search with empty player name
test_endpoint "${BASE_URL}/search?playerName=" \
    "Search with empty player name" \
    "false"

# Test 5: Search with special characters
test_endpoint "${BASE_URL}/search?playerName=Test%20Player" \
    "Search with special characters (space)" \
    "false"

# Test 6: Multiple searches in quick succession (test caching)
echo -e "${YELLOW}Testing: Multiple rapid searches (caching test)${NC}"
for i in {1..3}; do
    echo "Request $i:"
    time curl -s -X GET "${BASE_URL}/search?playerName=luke12" -H "Accept: application/json" | jq -r '.success'
done
echo "----------------------------------------"
echo ""

# Test 7: Get player stats (if search was successful)
echo -e "${YELLOW}Testing: Get player stats${NC}"
player_id=$(curl -s -X GET "${BASE_URL}/search?playerName=luke12" -H "Accept: application/json" | jq -r '.data[0].id')
if [ "$player_id" != "null" ] && [ -n "$player_id" ]; then
    echo "Found player ID: $player_id"
    test_endpoint "${BASE_URL}/player/$player_id" \
        "Get stats for player ID: $player_id" \
        "true"
else
    echo -e "${RED}✗ Could not extract player ID${NC}"
fi

# Summary
echo "=========================================="
echo "RETEST COMPLETE"
echo "=========================================="
echo ""
echo "Key Checks:"
echo "1. JSON Parsing: All responses should be valid JSON"
echo "2. Error Handling: Non-existent players should return success=false"
echo "3. Caching: Subsequent requests should be faster"
echo "4. No Crashes: All requests should complete without 500 errors"
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}Note: Install 'jq' for better JSON parsing: brew install jq${NC}"
fi