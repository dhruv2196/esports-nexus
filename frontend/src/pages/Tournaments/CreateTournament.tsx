import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert,
  Box,
  Stepper,
  Step,
  StepLabel,
  FormHelperText,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { tournamentService, CreateTournamentRequest } from '../../services/tournamentService';

const steps = ['Basic Information', 'Tournament Settings', 'Rules & Prize Pool'];

const CreateTournament: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateTournamentRequest>({
    name: '',
    gameId: '',
    bracketType: 'single_elimination',
    maxTeams: 8,
    prizePoolCents: 0,
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    rules: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateTournamentRequest, string>>>({});

  const games = [
    { id: 'pubg', name: 'PUBG/BGMI' },
    { id: 'valorant', name: 'Valorant' },
    { id: 'lol', name: 'League of Legends' },
    { id: 'csgo', name: 'CS:GO' },
    { id: 'fortnite', name: 'Fortnite' },
  ];

  const handleChange = (field: keyof CreateTournamentRequest) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const value = event.target ? event.target.value : event;
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'prizePoolCents' ? parseFloat(value) * 100 : value,
    }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof CreateTournamentRequest, string>> = {};

    switch (step) {
      case 0:
        if (!formData.name) newErrors.name = 'Tournament name is required';
        if (!formData.gameId) newErrors.gameId = 'Please select a game';
        break;
      case 1:
        if (formData.maxTeams < 2) newErrors.maxTeams = 'Minimum 2 teams required';
        if (formData.maxTeams > 256) newErrors.maxTeams = 'Maximum 256 teams allowed';
        if (formData.startDate <= new Date()) newErrors.startDate = 'Start date must be in the future';
        if (formData.endDate <= formData.startDate) newErrors.endDate = 'End date must be after start date';
        break;
      case 2:
        if (!formData.rules) newErrors.rules = 'Tournament rules are required';
        if (formData.prizePoolCents < 0) newErrors.prizePoolCents = 'Prize pool cannot be negative';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    setLoading(true);
    setError(null);

    try {
      const tournament = await tournamentService.createTournament(formData);
      navigate(`/tournaments/${tournament.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Tournament Name"
                value={formData.name}
                onChange={handleChange('name')}
                error={!!errors.name}
                helperText={errors.name}
                placeholder="e.g., Summer Championship 2024"
              />
            </Grid>
            <Grid size={12}>
              <FormControl fullWidth error={!!errors.gameId}>
                <InputLabel>Game</InputLabel>
                <Select
                  value={formData.gameId}
                  onChange={handleChange('gameId')}
                  label="Game"
                >
                  {games.map((game) => (
                    <MenuItem key={game.id} value={game.id}>
                      {game.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.gameId && <FormHelperText>{errors.gameId}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Bracket Type</InputLabel>
                <Select
                  value={formData.bracketType}
                  onChange={handleChange('bracketType')}
                  label="Bracket Type"
                >
                  <MenuItem value="single_elimination">Single Elimination</MenuItem>
                  <MenuItem value="double_elimination">Double Elimination</MenuItem>
                  <MenuItem value="round_robin">Round Robin</MenuItem>
                  <MenuItem value="swiss">Swiss</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Maximum Teams"
                value={formData.maxTeams}
                onChange={handleChange('maxTeams')}
                error={!!errors.maxTeams}
                helperText={errors.maxTeams}
                InputProps={{
                  inputProps: { min: 2, max: 256 },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Start Date & Time"
                  value={formData.startDate}
                  onChange={(newValue) => {
                    if (newValue) {
                      setFormData((prev) => ({ ...prev, startDate: newValue }));
                      setErrors((prev) => ({ ...prev, startDate: '' }));
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.startDate,
                      helperText: errors.startDate,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="End Date & Time"
                  value={formData.endDate}
                  onChange={(newValue) => {
                    if (newValue) {
                      setFormData((prev) => ({ ...prev, endDate: newValue }));
                      setErrors((prev) => ({ ...prev, endDate: '' }));
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.endDate,
                      helperText: errors.endDate,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Tournament Rules"
                value={formData.rules}
                onChange={handleChange('rules')}
                error={!!errors.rules}
                helperText={errors.rules || 'Describe the tournament rules, format, and any special conditions'}
                placeholder="1. All players must check-in 30 minutes before the tournament starts\n2. Match settings: TPP, Erangel, Custom Room\n3. Points system: 15 points per kill, placement points as per official rules\n4. Any use of cheats or exploits will result in immediate disqualification"
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                type="number"
                label="Prize Pool"
                value={formData.prizePoolCents / 100}
                onChange={handleChange('prizePoolCents')}
                error={!!errors.prizePoolCents}
                helperText={errors.prizePoolCents || 'Enter 0 for no prize pool'}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputProps: { min: 0, step: 0.01 },
                }}
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Create Tournament
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mt: 4, mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 3 }}>
            {getStepContent(activeStep)}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Tournament'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default CreateTournament;