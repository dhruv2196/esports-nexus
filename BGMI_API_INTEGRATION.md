# BGMI/PUBG API Integration Guide

## Overview

The Esports Nexus platform now supports BGMI (Battlegrounds Mobile India) player stats integration using the official PUBG API. Since BGMI uses the same infrastructure as PUBG, we can fetch real player data including stats, match history, and rankings.

## Features

- **Player Search**: Search for BGMI players by their in-game username
- **Stats Tracking**: View detailed player statistics including:
  - Kill/Death ratio
  - Win rate
  - Total wins (Chicken Dinners)
  - Match history
  - Season stats
  - Lifetime stats
- **Account Linking**: Link BGMI accounts to user profiles
- **Real-time Updates**: Fetch latest stats from the official API
- **Match Details**: View detailed information about specific matches
- **Performance Caching**: Intelligent caching to reduce API calls

## Setup Instructions

### 1. Get PUBG API Key

1. Visit [PUBG Developer Portal](https://developer.pubg.com/)
2. Create an account or sign in
3. Create a new app to get your API key
4. Note: The same API key works for BGMI

### 2. Configure API Key

Add your PUBG API key to the `.env` file:

```env
PUBG_API_KEY=your_actual_api_key_here
```

### 3. API Endpoints

The following endpoints are available:

#### Search Players
```
GET /api/game-stats/bgmi/search?playerName={username}
```

#### Get Player Stats
```
GET /api/game-stats/bgmi/player/{playerId}
```

#### Link BGMI Account (Authenticated)
```
POST /api/game-stats/bgmi/link
Body: { "playerName": "username" }
```

#### Get My Stats (Authenticated)
```
GET /api/game-stats/bgmi/my-stats
```

#### Get Match Details
```
GET /api/game-stats/bgmi/match/{matchId}
```

#### Get Player Matches
```
GET /api/game-stats/bgmi/player/{playerId}/matches?limit=5
```

## Frontend Usage

### Search and View Stats

```typescript
import { gameStatsService } from './services/gameStatsService';

// Search for players
const players = await gameStatsService.searchBgmiPlayers('playerName');

// Get player stats
const stats = await gameStatsService.getBgmiPlayerStats(playerId);

// Link account (for logged-in users)
await gameStatsService.linkBgmiAccount('playerName');

// Get my stats
const myStats = await gameStatsService.getMyBgmiStats();
```

### Stats Component

The `BgmiStats` component provides a complete UI for:
- Searching players
- Viewing stats
- Linking accounts
- Displaying statistics in a visually appealing format

## Data Structure

### Player Stats Response
```json
{
  "player": {
    "id": "account.xxx",
    "name": "PlayerName",
    "shardId": "steam"
  },
  "lifetimeStats": {
    "gameModeStats": {
      "squad-fpp": {
        "roundsPlayed": 1000,
        "wins": 100,
        "kills": 2500,
        "losses": 900,
        "assists": 800,
        "damageDealt": 500000,
        "timeSurvived": 360000
      }
    }
  },
  "currentSeasonStats": { ... }
}
```

## Platform Shards

The API supports different platforms:
- `steam` - PC version
- `kakao` - Kakao Games version
- `xbox` - Xbox
- `psn` - PlayStation

For BGMI mobile players, you may need to adjust the shard based on the platform.

## Rate Limits

The PUBG API has rate limits:
- 10 requests per minute for development
- Higher limits available for production apps

Our implementation includes caching to minimize API calls.

## Troubleshooting

### Player Not Found
- Ensure the username is spelled correctly
- Check if the player exists on the specified platform/shard
- Some players may have privacy settings that hide their stats

### API Key Issues
- Verify your API key is valid
- Check if the key has the necessary permissions
- Ensure the key is properly set in the environment variables

### No Stats Available
- Some game modes may not have stats
- New players might not have enough data
- Check if the season ID is correct

## Future Enhancements

1. **More Game Modes**: Add support for different game modes (Solo, Duo, etc.)
2. **Leaderboards**: Implement global and friend leaderboards
3. **Match Analysis**: Detailed match analysis with heatmaps
4. **Team Stats**: Support for clan/team statistics
5. **Mobile App**: React Native app for mobile users
6. **Webhooks**: Real-time notifications for achievements

## Contributing

To contribute to the BGMI integration:

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests
5. Submit a pull request

## Resources

- [PUBG API Documentation](https://documentation.pubg.com/)
- [API Status Page](https://developer.pubg.com/status)
- [Community Forums](https://forums.pubg.com/)

## License

This integration follows the PUBG API Terms of Service. Make sure to comply with their usage guidelines when using this in production.