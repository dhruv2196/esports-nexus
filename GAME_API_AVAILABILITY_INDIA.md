# Game API Availability in India - Research Report

**Date**: December 2024  
**Purpose**: Assess API availability for popular esports games in India for integration into the AI-powered esports platform

---

## Executive Summary

This report examines the availability and accessibility of official APIs for major esports titles in India. The findings will guide the technical implementation strategy for the esports platform's multi-game support feature.

---

## 1. PUBG/BGMI (Battlegrounds Mobile India)

### API Status: ⚠️ **Limited**

#### PUBG PC API
- **Provider**: KRAFTON, Inc.
- **Documentation**: https://documentation.pubg.com/
- **Access**: Available with API key registration
- **Limitations**: 
  - **Only supports PUBG PC players**
  - **Does NOT support mobile players (BGMI/PUBG Mobile)**
  - Rate limits apply
  - Requires developer account

#### BGMI/PUBG Mobile
- **Official API**: ❌ Not Available
- **Alternative Solutions**:
  - Web scraping (against ToS)
  - Third-party unofficial APIs (unreliable)
  - Community-built solutions

**Current Implementation**: The platform already handles PUBG PC API with malformed JSON fixes, but mobile support remains a challenge.

---

## 2. Valorant

### API Status: ✅ **Available**

#### Riot Games API
- **Provider**: Riot Games
- **Documentation**: https://developer.riotgames.com/docs/valorant
- **Access**: Free with registration
- **Features**:
  - Match history
  - Player statistics
  - Ranked information
  - Content data (agents, maps, weapons)
  - Real-time match data

#### Regional Availability
- **India Access**: ✅ Fully supported
- **Routing**: Asia cluster recommended
- **Rate Limits**: 
  - 20 requests every 1 second
  - 100 requests every 2 minutes

#### Implementation Notes
- OAuth2 integration available
- Requires Riot account linking
- PUUID-based player identification
- Comprehensive documentation

---

## 3. Call of Duty Mobile (CODM)

### API Status: ❌ **No Official API**

#### Official Support
- **Activision API**: Not available for mobile version
- **Alternative**: Unofficial community APIs exist

#### Unofficial Solutions
- **COD API (codapi.dev)**:
  - Community-maintained
  - Supports some COD titles
  - Mobile support is limited
  - Not officially endorsed

#### Challenges
- No official developer program for CODM
- Data accuracy concerns with unofficial APIs
- Legal/ToS compliance risks

---

## 4. Free Fire

### API Status: ⚠️ **Unofficial Only**

#### Official Support
- **Garena API**: ❌ No public API available
- **Developer Program**: Not accessible in India

#### Community Solutions
- **Unofficial APIs** (e.g., GitHub projects):
  - Limited functionality
  - Requires reverse engineering
  - Reliability issues
  - May violate ToS

#### Example Unofficial API
- **URL**: https://www.public.freefireinfo.site/api/
- **Features**: Account info, statistics
- **Limitations**: 
  - Not official
  - May break without notice
  - Limited data availability

---

## 5. League of Legends

### API Status: ✅ **Available** (Bonus - not in original roadmap)

#### Riot Games API
- **Same infrastructure as Valorant**
- **Full API access in India**
- **Features**:
  - Summoner data
  - Match history
  - Champion mastery
  - Ranked statistics
  - Live game data

---

## 6. Supercell Games (Clash Royale, Clash of Clans, Brawl Stars)

### API Status: ✅ **Available**

#### Supercell Developer API
- **Provider**: Supercell
- **Documentation**: 
  - Clash Royale: https://developer.clashroyale.com/
  - Clash of Clans: https://developer.clashofclans.com/
  - Brawl Stars: https://developer.brawlstars.com/
- **Access**: Free with registration
- **Features**:
  - Player profiles and statistics
  - Clan/Club information
  - Battle logs and match history
  - Leaderboards (global and local)
  - Tournament data
  - Real-time battle data (limited)

#### Regional Availability
- **India Access**: ✅ Fully supported
- **Rate Limits**: Varies by API tier
- **Authentication**: API token-based

#### Implementation Notes
- Well-documented APIs
- Active developer community
- Regular updates and maintenance
- Esports features for Clash Royale

---

## 7. Mobile Legends: Bang Bang

### API Status: ❌ **No Official API**

#### Official Support
- **Moonton API**: Not publicly available
- **Developer Program**: Closed/Private

#### Alternative Solutions
- **Unofficial APIs** (GitHub projects):
  - Limited player statistics
  - Hero win rates
  - Basic match data
  - Unreliable and may break

#### Challenges
- Moonton (owned by ByteDance) doesn't provide public APIs
- Data scraping is against ToS
- Most popular mobile MOBA but limited integration options

---

## 8. Arena of Valor / Honor of Kings

### API Status: ⚠️ **Complex Situation**

#### Background
- **Arena of Valor**: International version (Garena/Level Infinite)
- **Honor of Kings**: Chinese version going global (Tencent/TiMi)
- Both developed by TiMi Studio Group

#### API Availability
- **Official API**: ❌ Not publicly available
- **Regional Differences**: 
  - Honor of Kings launching globally in 2024
  - Arena of Valor continues separately
  - No unified API access

#### Challenges
- Complex publisher relationships
- Regional fragmentation
- No developer program

---

## 9. Pokémon UNITE

### API Status: ❌ **No Official API**

#### Official Support
- **Developer**: TiMi Studio Group
- **Publishers**: The Pokémon Company/Nintendo
- **API Access**: None available

#### Game Features
- Cross-platform (Mobile + Nintendo Switch)
- Growing esports scene
- No data access for third parties

---

## 10. eFootball (formerly PES)

### API Status: ❌ **No Official API**

#### Official Support
- **Developer**: Konami
- **Platform**: PC, Console, Mobile
- **API Access**: Not publicly available

#### Game Details
- **eFootball 2024**: Free-to-play football simulation
- **Cross-platform**: PC, Console, and Mobile versions
- **Esports**: Official eFootball Championship

#### Tournament Integration
- **Toornament Support**: Available as a discipline
- **Custom Fields**: PSN, Steam, Xbox Live IDs supported
- **Manual Stats**: Tournament organizers must track manually

#### Challenges
- Konami doesn't provide public APIs
- No automated stat tracking
- Manual result reporting required
- Limited third-party integration options

---

## 11. EA Sports FC (formerly FIFA)

### API Status: ❌ **No Official API**

#### Official Support
- **Developer**: EA Sports
- **Platform**: PC, Console, Mobile
- **API Access**: Not publicly available

#### EA FC 24 Details
- **Successor to FIFA series**
- **EA Sports FC Mobile**: Separate mobile version
- **FUT (Ultimate Team)**: Popular game mode

#### Community Solutions
- **Unofficial APIs**: 
  - Some community projects exist
  - Web scraping attempts (against ToS)
  - Limited reliability

#### Developer Interest
- **Community Demand**: High demand for API access
- **Forum Discussions**: Active requests on EA forums
- **No Official Response**: EA hasn't announced public API plans

---

## 12. Other Trending Mobile Esports Games

### Honor of Kings
- **API Status**: ⚠️ Regional (China)
- **Developer**: TiMi Studio Group
- **Note**: Massive in China, global version expanding
- **Prize Pools**: $20+ million in 2024

### Free Fire
- **API Status**: ⚠️ Unofficial Only
- **Developer**: Garena
- **Esports**: Free Fire World Series
- **Prize Pool**: $1+ million events

### Brawl Stars
- **API Status**: ✅ Available (Supercell)
- **Documentation**: https://developer.brawlstars.com/
- **Features**: Player profiles, battle logs, club data

### Chess.com
- **API Status**: ✅ Available
- **Documentation**: Public API available
- **Features**: Player data, game history, tournaments

### Teamfight Tactics Mobile
- **API Status**: ⚠️ Limited (via Riot API)
- **Provider**: Riot Games
- **Note**: Some data through main Riot API

### Marvel Rivals (Upcoming)
- **API Status**: ❓ Unknown
- **Developer**: NetEase
- **Platform**: PC and Mobile planned
- **Note**: High anticipation for 2025

### Fortnite Mobile
- **API Status**: ❌ Not Available
- **Developer**: Epic Games
- **Note**: Mobile version recently returned to app stores
- **Esports**: Cross-platform and mobile-only cups

### VALORANT Mobile (Upcoming)
- **API Status**: ❓ Expected (Riot Games)
- **Release**: TBA (China confirmed)
- **Expectation**: Likely to have API support like PC version

---

## 13. Other Notable Esports Games

### PUBG: New State
- **API Status**: ❌ Not Available
- **Publisher**: KRAFTON
- **Note**: Despite same publisher as PUBG PC, no API

### Apex Legends Mobile
- **API Status**: ❌ Game Discontinued (May 2023)
- **Note**: Was published by EA, no API was available

### Wild Rift (League of Legends Mobile)
- **API Status**: ⚠️ Limited
- **Provider**: Riot Games
- **Note**: Some data available through main LoL API, but limited mobile-specific features

### Rocket League Sideswipe
- **API Status**: ❌ Not Available
- **Developer**: Psyonix
- **Note**: 2D mobile version, community tournaments only

### Street Fighter 6
- **API Status**: ❌ Not Available
- **Developer**: Capcom
- **Esports**: Capcom Pro Tour
- **Note**: Major FGC title, no public API

### Tekken 8
- **API Status**: ❌ Not Available
- **Developer**: Bandai Namco
- **Esports**: Tekken World Tour
- **Note**: Popular fighting game, manual tracking

### Rainbow Six Mobile (Upcoming)
- **API Status**: ❓ Unknown
- **Developer**: Ubisoft
- **Note**: Mobile version in development

---

## Summary Table

| Game | API Status | Provider | India Access | Integration Difficulty |
|------|------------|----------|--------------|----------------------|
| **Valorant** | ✅ Available | Riot Games | ✅ Full | Easy |
| **League of Legends** | ✅ Available | Riot Games | ✅ Full | Easy |
| **Clash Royale** | ✅ Available | Supercell | ✅ Full | Easy |
| **Clash of Clans** | ✅ Available | Supercell | ✅ Full | Easy |
| **Brawl Stars** | ✅ Available | Supercell | ✅ Full | Easy |
| **Chess.com** | ✅ Available | Chess.com | ✅ Full | Easy |
| **PUBG PC** | ✅ Available | KRAFTON | ✅ Full | Medium |
| **Wild Rift** | ⚠️ Limited | Riot Games | ⚠️ Partial | Medium |
| **TFT Mobile** | ⚠️ Limited | Riot Games | ⚠️ Partial | Medium |
| **Free Fire** | ⚠️ Unofficial | Garena | ⚠️ Risky | Hard |
| **Honor of Kings** | ⚠️ Regional | Tencent | ⚠️ China Only | Hard |
| **BGMI/PUBG Mobile** | ❌ Not Available | KRAFTON | ❌ None | Very Hard |
| **CODM** | ❌ Not Available | Activision | ❌ None | Very Hard |
| **Mobile Legends** | ❌ Not Available | Moonton | ❌ None | Very Hard |
| **Arena of Valor** | ❌ Not Available | Garena/Tencent | ❌ None | Very Hard |
| **Pokémon UNITE** | ❌ Not Available | TPC/Nintendo | ❌ None | Very Hard |
| **eFootball** | ❌ Not Available | Konami | ❌ None | Very Hard |
| **EA FC 24** | ❌ Not Available | EA Sports | ❌ None | Very Hard |
| **Fortnite Mobile** | ❌ Not Available | Epic Games | ❌ None | Very Hard |
| **Street Fighter 6** | ❌ Not Available | Capcom | ❌ None | Very Hard |
| **Tekken 8** | ❌ Not Available | Bandai Namco | ❌ None | Very Hard |

---

## Recommendations

### 1. **Immediate Implementation Priority**
- **Valorant**: Full API integration possible immediately
- **League of Legends**: Consider adding to roadmap due to API availability
- **Supercell Games** (Clash Royale, Clash of Clans, Brawl Stars): Excellent API support for mobile esports
- **Chess.com**: Growing esports scene with full API support

### 2. **Games with Strong Potential**
- **Wild Rift**: Partial data through Riot API
- **Teamfight Tactics Mobile**: Partial data through Riot API
- **Honor of Kings**: Massive prize pools but regional limitations
- **Free Fire**: Large player base despite API limitations
- **VALORANT Mobile** (when released): Expected strong API support

### 3. **Alternative Strategies for Limited APIs**

#### For BGMI/PUBG Mobile:
- Partner directly with KRAFTON for API access
- Build a player-submitted stats system
- Focus on PC PUBG data initially
- Explore official partnerships

#### For CODM:
- Implement manual stat tracking
- Community-driven data collection
- Monitor for official API announcements
- Use social features without direct game data

#### For Free Fire:
- Focus on tournament organization features
- Manual result reporting system
- Community features without automated stats
- Await official API availability

#### For Mobile Legends:
- Tournament management without automated stats
- Community-driven content
- Manual team/player profiles
- Social features focus

#### For eFootball:
- Leverage Toornament integration
- Manual tournament management
- Focus on championship organization
- Community-driven statistics

#### For EA FC 24:
- Monitor EA forums for API announcements
- Build manual tracking systems
- Focus on FUT tournament organization
- Community-sourced data collection

### 4. **Technical Architecture Considerations**

```javascript
// Proposed API Adapter Pattern
interface GameAPIAdapter {
  getPlayerStats(playerId: string): Promise<PlayerStats>;
  getMatchHistory(playerId: string): Promise<Match[]>;
  searchPlayer(query: string): Promise<Player[]>;
}

// Implementations
class ValorantAPIAdapter implements GameAPIAdapter {
  // Full implementation with official API
}

class BGMIAPIAdapter implements GameAPIAdapter {
  // Hybrid approach: PC data + manual mobile data
}

class CODMAPIAdapter implements GameAPIAdapter {
  // Community-sourced data + manual input
}
```

class ClashRoyaleAPIAdapter implements GameAPIAdapter {
  // Full implementation with official Supercell API
}

class ChessAPIAdapter implements GameAPIAdapter {
  // Full implementation with Chess.com API
}

### 5. **Risk Mitigation**

1. **Legal Compliance**:
   - Only use official APIs where available
   - Avoid ToS violations
   - Implement proper attribution

2. **Data Reliability**:
   - Cache API responses
   - Implement fallback mechanisms
   - Allow manual data correction

3. **Scalability**:
   - Design for multiple data sources
   - Abstract API implementations
   - Plan for future official APIs

---

## Implementation Timeline

### Phase 1 (Q1 2025)
- ✅ Valorant full integration (official API)
- ✅ Supercell games integration (Clash Royale, Brawl Stars priority)
- ✅ Chess.com integration (growing esports scene)
- ⚠️ CODM basic integration (manual/community data)
- ✅ Enhance existing PUBG PC support

### Phase 2 (Q2 2025)
- ⚠️ Free Fire community features (no automated stats)
- ⚠️ Mobile Legends tournament features
- ⚠️ eFootball tournament organization
- ⚠️ EA FC 24 community features
- 🔄 Monitor for new API availability (especially VALORANT Mobile)
- 📊 Build proprietary data collection systems

### Phase 3 (Q3 2025)
- 🤝 Pursue official partnerships for API access (EA, Konami, Epic)
- 🔧 Refine manual data collection processes
- 📈 Scale successful integrations
- ✅ Add remaining Supercell games (Clash of Clans)
- 🎮 Prepare for upcoming releases (VALORANT Mobile, Rainbow Six Mobile)

---

## Conclusion

The research reveals a mixed landscape for game API availability in India:

**Games with Excellent API Support:**
- Riot Games titles (Valorant, League of Legends, partial Wild Rift/TFT)
- Supercell games (Clash Royale, Clash of Clans, Brawl Stars)
- PUBG PC (not mobile)
- Chess.com

**Games without Official APIs:**
- Most popular mobile esports titles (BGMI, CODM, Free Fire, Mobile Legends)
- TiMi Studio games (Arena of Valor, Honor of Kings, Pokémon UNITE)
- Sports simulations (eFootball, EA FC 24)
- Fighting games (Street Fighter 6, Tekken 8)
- Battle royales (Fortnite Mobile, PUBG: New State)

The platform should adopt a multi-pronged strategy:

1. **Prioritize games with APIs** for immediate, full-featured integration
2. **Build hybrid solutions** for popular games without APIs
3. **Actively pursue partnerships** with publishers like KRAFTON, Activision, Garena, and Moonton
4. **Design flexible architecture** that can adapt as new APIs become available
5. **Consider alternative games** with API support to fill gaps in the portfolio

This approach ensures the platform can launch with robust features for some games while building community-driven solutions for others, positioning for long-term success in the Indian esports market.

---

## Resources

1. **Riot Developer Portal**: https://developer.riotgames.com/
2. **PUBG API Documentation**: https://documentation.pubg.com/
3. **Supercell Developer Portal**: https://developer.clashroyale.com/
4. **Chess.com API**: https://www.chess.com/news/view/published-data-api
5. **Toornament API**: https://developer.toornament.com/
6. **Community Forums**: Discord channels for unofficial API discussions
7. **GitHub Repositories**: Various community API implementations
8. **EA Forums**: https://forums.ea.com/ (for FC 24 discussions)

---

**Note**: API availability and terms are subject to change. Regular monitoring of official announcements is recommended.

---

## Appendix: 2025 Mobile Esports Trends

Based on recent market analysis:

1. **Mobile Dominance**: Mobile esports viewership continues to grow, with Mobile Legends: Bang Bang reaching 475.96 million hours watched
2. **Cross-Platform Play**: Games like Fortnite and eFootball offering unified experiences
3. **Regional Variations**: Asian markets dominating mobile esports (Honor of Kings, Free Fire, MLBB)
4. **Prize Pool Growth**: Mobile games offering million-dollar tournaments
5. **API Gap**: Despite popularity, most mobile games lack official APIs

**Key Takeaway**: The platform must balance between games with APIs and popular titles without APIs to capture the Indian esports market effectively.