# Setting Up Personal GitHub Account

## Quick Setup Guide

### 1. Configure Git for This Repository Only

The repository is already configured to use local git settings. You need to update them with your personal details:

```bash
cd /Users/dhruv.singhal/practice/esport/esports-nexus

# Set your personal GitHub username and email (local to this repo only)
git config --local user.name "your-personal-github-username"
git config --local user.email "your-personal-email@example.com"
```

### 2. Create Personal Access Token

Since GitHub no longer accepts passwords for git operations, you need a Personal Access Token:

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "esports-nexus-push")
4. Select scopes:
   - ✅ repo (all)
   - ✅ workflow (if using GitHub Actions)
5. Click "Generate token"
6. **COPY THE TOKEN NOW** (you won't see it again!)

### 3. Create Repository on GitHub

1. Go to https://github.com/new (make sure you're logged into your personal account)
2. Create repository:
   - Name: `esports-nexus`
   - Description: `Full-stack esports tournament platform with BGMI/PUBG integration`
   - Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license

### 4. Push Your Code

Option A: Use the provided script:
```bash
./push-to-personal-github.sh
```

Option B: Manual commands:
```bash
# Remove any existing remote
git remote remove origin

# Add your personal repository as origin
git remote add origin https://github.com/YOUR_USERNAME/esports-nexus.git

# Push the code
git push -u origin main
```

When prompted for credentials:
- Username: your-github-username
- Password: YOUR_PERSONAL_ACCESS_TOKEN (not your GitHub password!)

### 5. Alternative: Use SSH (Recommended for Long-term Use)

If you frequently push to your personal GitHub:

1. Generate SSH key for personal account:
```bash
ssh-keygen -t ed25519 -C "your-personal-email@example.com" -f ~/.ssh/id_ed25519_personal
```

2. Add to SSH agent:
```bash
ssh-add ~/.ssh/id_ed25519_personal
```

3. Add public key to GitHub:
```bash
cat ~/.ssh/id_ed25519_personal.pub
# Copy this and add to https://github.com/settings/keys
```

4. Configure SSH for personal GitHub:
```bash
# Add to ~/.ssh/config
Host github.com-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
```

5. Use SSH URL:
```bash
git remote set-url origin git@github.com-personal:YOUR_USERNAME/esports-nexus.git
```

## Troubleshooting

### Authentication Failed
- Make sure you're using Personal Access Token, not password
- Check if token has correct permissions (repo scope)
- Token might be expired

### Push Rejected
- Make sure repository exists on GitHub
- Check if you have push permissions
- Verify branch name (main vs master)

### Wrong Account
- Check current config: `git config --local --list`
- Make sure you're using `--local` flag for config
- Clear credential cache if needed: `git credential-osxkeychain erase`

## Security Notes

1. Never commit your Personal Access Token
2. The `.env` file is already in .gitignore
3. Add any other sensitive files to .gitignore before pushing
4. Consider using SSH keys for better security

## Success!

Once pushed, your repository will be available at:
`https://github.com/YOUR_USERNAME/esports-nexus`

Don't forget to:
- Add a LICENSE file
- Set up GitHub Secrets for CI/CD
- Update the README with your repo URL
- Star your own repo! ⭐