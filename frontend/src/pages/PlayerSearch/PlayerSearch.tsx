import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  Chip,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as StatsIcon,
  Refresh as RefreshIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { gameService } from '../../services/gameService';
import { aiService } from '../../services/aiService';

const PlayerSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [platform, setPlatform] = useState('steam');
  const [game, setGame] = useState('pubg');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [playerStats, setPlayerStats] = useState<any>(null);
  const [playerInsights, setPlayerInsights] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const platforms = {
    pubg: [
      { value: 'steam', label: 'Steam (PC)' },
      { value: 'kakao', label: 'Kakao' },
      { value: 'xbox', label: 'Xbox' },
      { value: 'psn', label: 'PlayStation' },
    ],
    lol: [
      { value: 'na1', label: 'North America' },
      { value: 'euw1', label: 'Europe West' },
      { value: 'kr', label: 'Korea' },
      { value: 'eun1', label: 'Europe Nordic & East' },
    ],
    valorant: [
      { value: 'na', label: 'North America' },
      { value: 'eu', label: 'Europe' },
      { value: 'ap', label: 'Asia Pacific' },
      { value: 'kr', label: 'Korea' },
    ],
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a player name');
      return;
    }

    setLoading(true);
    setError(null);
    setSearchResults([]);
    setSelectedPlayer(null);
    setPlayerStats(null);

    try {
      let results;
      if (game === 'pubg') {
        results = await gameService.pubg.searchPlayer(searchQuery, platform as any);
      } else if (game === 'lol') {
        results = await gameService.riot.getSummonerByName(searchQuery, platform);
      } else {
        results = await gameService.searchPlayers({
          query: searchQuery,
          platform: platform as any,
        });
      }

      // Ensure results is an array
      const resultsArray = Array.isArray(results) ? results : [results];
      setSearchResults(resultsArray);

      // If only one result, auto-select it
      if (resultsArray.length === 1) {
        handlePlayerSelect(resultsArray[0]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to search for player');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerSelect = async (player: any) => {
    setSelectedPlayer(player);
    setLoadingStats(true);
    setPlayerStats(null);
    setPlayerInsights(null);

    try {
      // Get player stats
      const stats = await gameService.getPlayerStats(platform, player.id || player.playerId);
      setPlayerStats(stats);

      // Try to get AI insights (may not be available for all players)
      try {
        const insights = await aiService.getPlayerInsights(player.id || player.playerId);
        setPlayerInsights(insights);
      } catch (err) {
        console.log('AI insights not available for this player');
      }
    } catch (err: any) {
      setError('Failed to load player statistics');
    } finally {
      setLoadingStats(false);
    }
  };

  const formatStat = (value: any, decimals: number = 2): string => {
    if (typeof value === 'number') {
      return value.toFixed(decimals);
    }
    return value || 'N/A';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" gutterBottom align="center">
          Player Search & Statistics
        </Typography>

        {/* Search Form */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Game</InputLabel>
                <Select
                  value={game}
                  onChange={(e) => {
                    setGame(e.target.value);
                    setPlatform(Object.keys(platforms[e.target.value as keyof typeof platforms])[0]);
                  }}
                  label="Game"
                >
                  <MenuItem value="pubg">PUBG/BGMI</MenuItem>
                  <MenuItem value="lol">League of Legends</MenuItem>
                  <MenuItem value="valorant">Valorant</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Platform/Region</InputLabel>
                <Select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  label="Platform/Region"
                >
                  {platforms[game as keyof typeof platforms]?.map((p) => (
                    <MenuItem key={p.value} value={p.value}>
                      {p.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Player Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter player name..."
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSearch}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && !selectedPlayer && (
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Search Results
            </Typography>
            <List>
              {searchResults.map((player, index) => (
                <React.Fragment key={player.id || index}>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handlePlayerSelect(player)}>
                      <Avatar sx={{ mr: 2 }}>
                        <PersonIcon />
                      </Avatar>
                      <ListItemText
                        primary={player.name || player.playerName || player.summonerName}
                        secondary={`ID: ${player.id || player.playerId || player.puuid}`}
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < searchResults.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}

        {/* Player Stats */}
        {selectedPlayer && (
          <Grid container spacing={3}>
            {/* Player Overview */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar sx={{ width: 60, height: 60, mr: 2 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {selectedPlayer.name || selectedPlayer.playerName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {platform} • {game.toUpperCase()}
                      </Typography>
                    </Box>
                  </Box>

                  {loadingStats ? (
                    <Box display="flex" justifyContent="center" py={3}>
                      <CircularProgress />
                    </Box>
                  ) : playerStats ? (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" gutterBottom>
                        General Stats
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {playerStats.stats?.level && (
                          <Typography variant="body2">
                            Level: {playerStats.stats.level}
                          </Typography>
                        )}
                        {playerStats.stats?.wins !== undefined && (
                          <Typography variant="body2">
                            Wins: {playerStats.stats.wins}
                          </Typography>
                        )}
                        {playerStats.stats?.kd !== undefined && (
                          <Typography variant="body2">
                            K/D Ratio: {formatStat(playerStats.stats.kd)}
                          </Typography>
                        )}
                        {playerStats.stats?.winRate !== undefined && (
                          <Typography variant="body2">
                            Win Rate: {formatStat(playerStats.stats.winRate)}%
                          </Typography>
                        )}
                      </Box>
                    </>
                  ) : null}

                  <Box sx={{ mt: 2 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={() => handlePlayerSelect(selectedPlayer)}
                      disabled={loadingStats}
                    >
                      Refresh Stats
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Detailed Stats */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Detailed Statistics
                  </Typography>

                  {loadingStats ? (
                    <Box display="flex" justifyContent="center" py={5}>
                      <CircularProgress />
                    </Box>
                  ) : playerStats ? (
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Box textAlign="center">
                          <TrophyIcon color="primary" sx={{ fontSize: 40 }} />
                          <Typography variant="h5">
                            {playerStats.stats?.wins || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Wins
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Box textAlign="center">
                          <StatsIcon color="success" sx={{ fontSize: 40 }} />
                          <Typography variant="h5">
                            {formatStat(playerStats.stats?.kd || 0)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            K/D Ratio
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Box textAlign="center">
                          <StarIcon color="warning" sx={{ fontSize: 40 }} />
                          <Typography variant="h5">
                            {playerStats.stats?.kills || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Kills
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Box textAlign="center">
                          <PersonIcon color="info" sx={{ fontSize: 40 }} />
                          <Typography variant="h5">
                            {playerStats.stats?.losses || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Losses
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  ) : (
                    <Alert severity="info">
                      No statistics available for this player
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* AI Insights */}
              {playerInsights && (
                <Card sx={{ mt: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      AI Performance Insights
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Performance Trend
                      </Typography>
                      <Chip
                        label={playerInsights.performanceTrend}
                        color={
                          playerInsights.performanceTrend === 'improving'
                            ? 'success'
                            : playerInsights.performanceTrend === 'declining'
                            ? 'error'
                            : 'default'
                        }
                      />
                    </Box>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Strengths
                        </Typography>
                        <Box>
                          {playerInsights.strengths.map((strength: string, index: number) => (
                            <Chip
                              key={index}
                              label={strength}
                              size="small"
                              sx={{ mr: 1, mb: 1 }}
                              color="primary"
                            />
                          ))}
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Areas for Improvement
                        </Typography>
                        <Box>
                          {playerInsights.weaknesses.map((weakness: string, index: number) => (
                            <Chip
                              key={index}
                              label={weakness}
                              size="small"
                              sx={{ mr: 1, mb: 1 }}
                              color="secondary"
                            />
                          ))}
                        </Box>
                      </Grid>
                    </Grid>

                    {playerInsights.recommendations.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Recommendations
                        </Typography>
                        <List dense>
                          {playerInsights.recommendations.map((rec: string, index: number) => (
                            <ListItem key={index}>
                              <ListItemText primary={`• ${rec}`} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        )}
      </motion.div>
    </Container>
  );
};

export default PlayerSearch;