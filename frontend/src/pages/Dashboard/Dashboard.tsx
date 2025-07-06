import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  EmojiEvents,
  EmojiEvents as TournamentIcon,
  SportsEsports as GameIcon,
  TrendingUp as StatsIcon,
  Payment as PaymentIcon,
  Group as TeamIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Import all services
import { tournamentService } from '../../services/tournamentService';
import { gameService } from '../../services/gameService';
import { aiService } from '../../services/aiService';
import { paymentService } from '../../services/paymentService';
import { authService } from '../../services/authService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for different data
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load tournaments
      try {
        const tournamentsData = await tournamentService.getTournaments();
        // Ensure we have an array
        const tournamentsArray = Array.isArray(tournamentsData) ? tournamentsData : [];
        setTournaments(tournamentsArray.slice(0, 5)); // Show only 5 most recent
      } catch (err) {
        console.error('Failed to load tournaments:', err);
        setTournaments([]);
      }

      // Load user stats (mock for now)
      setUserStats({
        totalMatches: 156,
        wins: 89,
        winRate: 57,
        currentRank: 'Diamond II',
        tournamentWins: 3,
      });

      // Load payment history
      try {
        const paymentData = await paymentService.getPaymentHistory(5);
        setPayments(Array.isArray(paymentData) ? paymentData : []);
      } catch (err) {
        console.log('Payment service not available');
        setPayments([]);
      }

      // Mock recent matches
      setRecentMatches([
        { id: 1, game: 'PUBG', result: 'Win', kills: 8, placement: 1, date: new Date() },
        { id: 2, game: 'Valorant', result: 'Loss', kills: 15, deaths: 12, date: new Date() },
        { id: 3, game: 'PUBG', result: 'Win', kills: 5, placement: 2, date: new Date() },
      ]);

    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome back, Player!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's your gaming overview
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Stats Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Matches
                    </Typography>
                    <Typography variant="h4">
                      {userStats?.totalMatches || 0}
                    </Typography>
                  </Box>
                  <GameIcon color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Win Rate
                    </Typography>
                    <Typography variant="h4">
                      {userStats?.winRate || 0}%
                    </Typography>
                  </Box>
                  <StatsIcon color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Current Rank
                    </Typography>
                    <Typography variant="h5">
                      {userStats?.currentRank || 'Unranked'}
                    </Typography>
                  </Box>
                  <TournamentIcon color="warning" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Tournament Wins
                    </Typography>
                    <Typography variant="h4">
                      {userStats?.tournamentWins || 0}
                    </Typography>
                  </Box>
                  <EmojiEvents color="error" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Main Content Tabs */}
        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Tournaments" icon={<TournamentIcon />} />
            <Tab label="Recent Matches" icon={<GameIcon />} />
            <Tab label="Analytics" icon={<StatsIcon />} />
            <Tab label="Payments" icon={<PaymentIcon />} />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            {/* Tournaments Tab */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Active Tournaments</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/tournaments/create')}
              >
                Create Tournament
              </Button>
            </Box>

            <Grid container spacing={2}>
              {!Array.isArray(tournaments) || tournaments.length === 0 ? (
                <Grid size={12}>
                  <Alert severity="info">No active tournaments found</Alert>
                </Grid>
              ) : (
                tournaments.map((tournament) => (
                  <Grid size={{ xs: 12, md: 6 }} key={tournament.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {tournament.name}
                        </Typography>
                        <Box display="flex" gap={1} mb={1}>
                          <Chip label={tournament.status} size="small" color="primary" />
                          <Chip label={`${tournament.currentTeams}/${tournament.maxTeams} teams`} size="small" />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Prize Pool: ${(tournament.prizePoolCents / 100).toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Starts: {new Date(tournament.startDate).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small" onClick={() => navigate(`/tournaments/${tournament.id}`)}>
                          View Details
                        </Button>
                        <Button size="small" color="primary">
                          Register
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {/* Recent Matches Tab */}
            <List>
              {recentMatches.map((match) => (
                <React.Fragment key={match.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: match.result === 'Win' ? 'success.main' : 'error.main' }}>
                        <GameIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${match.game} - ${match.result}`}
                      secondary={
                        <>
                          {match.kills && `Kills: ${match.kills}`}
                          {match.placement && ` | Placement: #${match.placement}`}
                          {` | ${match.date.toLocaleDateString()}`}
                        </>
                      }
                    />
                    <Button size="small">View Details</Button>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {/* Analytics Tab */}
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Performance Insights
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Your performance has been <Chip label="Improving" color="success" size="small" /> over the last month.
                    </Typography>
                    <Typography variant="body2">
                      • Win rate increased by 12%
                    </Typography>
                    <Typography variant="body2">
                      • Average K/D improved to 1.8
                    </Typography>
                    <Typography variant="body2">
                      • Best performing game: PUBG
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary">
                      View Full Analysis
                    </Button>
                  </CardActions>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      AI Recommendations
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Based on your recent performance:
                    </Typography>
                    <Typography variant="body2">
                      • Focus on early game positioning
                    </Typography>
                    <Typography variant="body2">
                      • Practice recoil control with AKM
                    </Typography>
                    <Typography variant="body2">
                      • Consider playing more duo matches
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary">
                      Get Training Plan
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {/* Payments Tab */}
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Payment History
              </Typography>
              {!Array.isArray(payments) || payments.length === 0 ? (
                <Alert severity="info">No payment history available</Alert>
              ) : (
                <List>
                  {payments.map((payment) => (
                    <ListItem key={payment.id}>
                      <ListItemText
                        primary={payment.description}
                        secondary={`${payment.amount} ${payment.currency} - ${payment.status}`}
                      />
                      <Typography variant="body2">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box>
              <Typography variant="h6" gutterBottom>
                Subscription Status
              </Typography>
              <Card>
                <CardContent>
                  <Typography variant="body1">
                    Free Plan
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upgrade to Pro for advanced analytics and priority tournament access
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button variant="contained" color="primary">
                    Upgrade to Pro
                  </Button>
                </CardActions>
              </Card>
            </Box>
          </TabPanel>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default Dashboard;