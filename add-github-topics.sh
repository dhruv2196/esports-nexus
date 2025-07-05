#!/bin/bash

echo "=========================================="
echo "Adding GitHub Repository Topics"
echo "=========================================="
echo ""

# Repository topics to make it discoverable
TOPICS=(
    "esports"
    "gaming"
    "tournament-management"
    "spring-boot"
    "react"
    "typescript"
    "mongodb"
    "docker"
    "kubernetes"
    "bgmi"
    "pubg"
    "websocket"
    "jwt-auth"
    "full-stack"
    "java"
    "rest-api"
    "gaming-platform"
    "esports-platform"
    "tournament-platform"
    "player-stats"
)

echo "The following topics will be added to your repository:"
echo ""
for topic in "${TOPICS[@]}"; do
    echo "  - $topic"
done
echo ""

echo "To add these topics:"
echo "1. Go to https://github.com/dhruv2196/esports-nexus"
echo "2. Click the gear icon next to 'About' section"
echo "3. In the 'Topics' field, add the following topics:"
echo ""
echo "${TOPICS[@]}"
echo ""
echo "4. Click 'Save changes'"
echo ""

# If you have gh CLI with proper permissions, you can uncomment this:
# echo "Or run this command if you have gh CLI configured:"
# echo "gh repo edit dhruv2196/esports-nexus --add-topic \"${TOPICS[*]}\""

echo "Additional Repository Settings to Consider:"
echo ""
echo "1. Add a description:"
echo "   'Full-stack esports tournament platform with BGMI/PUBG integration, real-time updates, and modern UI'"
echo ""
echo "2. Add a website URL (when deployed):"
echo "   Your deployment URL"
echo ""
echo "3. Enable these GitHub features:"
echo "   - Issues (for bug tracking)"
echo "   - Discussions (for community engagement)"
echo "   - Wiki (for documentation)"
echo "   - Projects (for task management)"
echo ""
echo "4. Add repository badges to README:"
echo "   - Build status"
echo "   - Code coverage"
echo "   - Dependencies status"
echo ""

# Create a topics file for reference
echo "${TOPICS[@]}" > github-topics.txt
echo "Topics saved to github-topics.txt for reference"