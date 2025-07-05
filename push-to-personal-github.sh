sd#!/bin/bash

echo "=========================================="
echo "Push to Personal GitHub Account"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d ".git" ]; then
    echo -e "${RED}Error: Not in a git repository${NC}"
    exit 1
fi

echo -e "${YELLOW}Current git configuration:${NC}"
echo "User Name: $(git config --local user.name)"
echo "User Email: $(git config --local user.email)"
echo ""

# Step 1: Update local git config
echo -e "${YELLOW}Step 1: Configure your personal GitHub account locally${NC}"
read -p "Enter your personal GitHub username: " github_username
read -p "Enter your personal GitHub email: " github_email

git config --local user.name "$github_username"
git config --local user.email "$github_email"

echo -e "${GREEN}✓ Local git config updated${NC}"
echo ""

# Step 2: Create repository on GitHub
echo -e "${YELLOW}Step 2: Create repository on GitHub${NC}"
echo "Please go to https://github.com/new and create a new repository with:"
echo "  - Repository name: esports-nexus"
echo "  - Description: Full-stack esports tournament platform with BGMI/PUBG integration"
echo "  - Choose Private or Public"
echo "  - DO NOT initialize with README, .gitignore, or license"
echo ""
read -p "Press Enter after creating the repository..."

# Step 3: Add remote
echo -e "${YELLOW}Step 3: Add remote repository${NC}"
echo "Enter your repository URL (e.g., https://github.com/$github_username/esports-nexus.git)"
read -p "Repository URL: " repo_url

# Remove existing origin if it exists
git remote remove origin 2>/dev/null

# Add new origin
git remote add origin "$repo_url"
echo -e "${GREEN}✓ Remote repository added${NC}"
echo ""

# Step 4: Push to GitHub
echo -e "${YELLOW}Step 4: Push to GitHub${NC}"
echo "You may be prompted for your GitHub credentials."
echo "For authentication, you can use:"
echo "  - Username: Your GitHub username"
echo "  - Password: Your Personal Access Token (not your GitHub password)"
echo ""
echo "To create a Personal Access Token:"
echo "1. Go to https://github.com/settings/tokens"
echo "2. Click 'Generate new token (classic)'"
echo "3. Give it a name and select 'repo' scope"
echo "4. Copy the token and use it as your password"
echo ""
read -p "Press Enter when ready to push..."

# Push to GitHub
echo "Pushing to GitHub..."
if git push -u origin main; then
    echo -e "${GREEN}✓ Successfully pushed to GitHub!${NC}"
    echo ""
    echo "Your repository is now available at:"
    echo "$repo_url"
    echo ""
    echo "Next steps:"
    echo "1. Add a LICENSE file if needed"
    echo "2. Set up GitHub Actions secrets for deployment"
    echo "3. Configure branch protection rules"
    echo "4. Update README with your repository URL"
else
    echo -e "${RED}✗ Push failed${NC}"
    echo "Common issues:"
    echo "1. Authentication failed - Make sure to use a Personal Access Token"
    echo "2. Repository doesn't exist - Create it on GitHub first"
    echo "3. Wrong URL - Check the repository URL"
fi