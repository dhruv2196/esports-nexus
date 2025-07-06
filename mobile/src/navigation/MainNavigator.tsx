import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

// Tab Screens
import { HomeScreen } from '@screens/Home/HomeScreen';
import { TournamentListScreen } from '@screens/Tournaments/TournamentListScreen';
import { TeamListScreen } from '@screens/Teams/TeamListScreen';
import { StatsScreen } from '@screens/Stats/StatsScreen';
import { ProfileScreen } from '@screens/Profile/ProfileScreen';

// Stack Screens
import { TournamentDetailsScreen } from '@screens/Tournaments/TournamentDetailsScreen';
import { CreateTournamentScreen } from '@screens/Tournaments/CreateTournamentScreen';
import { TournamentBracketScreen } from '@screens/Tournaments/TournamentBracketScreen';
import { TeamDetailsScreen } from '@screens/Teams/TeamDetailsScreen';
import { CreateTeamScreen } from '@screens/Teams/CreateTeamScreen';
import { PlayerDetailsScreen } from '@screens/Players/PlayerDetailsScreen';
import { SettingsScreen } from '@screens/Settings/SettingsScreen';
import { PaymentScreen } from '@screens/Payment/PaymentScreen';
import { SubscriptionScreen } from '@screens/Payment/SubscriptionScreen';

export type MainTabParamList = {
  Home: undefined;
  Tournaments: undefined;
  Teams: undefined;
  Stats: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  TournamentDetails: { tournamentId: string };
  CreateTournament: undefined;
  TournamentBracket: { tournamentId: string };
  TeamDetails: { teamId: string };
  CreateTeam: undefined;
  PlayerDetails: { playerId: string };
  Settings: undefined;
  Payment: { type: 'tournament' | 'subscription'; data?: any };
  Subscription: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

const MainTabs: React.FC = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Tournaments':
              iconName = focused ? 'trophy' : 'trophy-outline';
              break;
            case 'Teams':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Stats':
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.disabled,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.backdrop,
          borderTopWidth: 1,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tournaments" component={TournamentListScreen} />
      <Tab.Screen name="Teams" component={TeamListScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="TournamentDetails" component={TournamentDetailsScreen} />
      <Stack.Screen name="CreateTournament" component={CreateTournamentScreen} />
      <Stack.Screen name="TournamentBracket" component={TournamentBracketScreen} />
      <Stack.Screen name="TeamDetails" component={TeamDetailsScreen} />
      <Stack.Screen name="CreateTeam" component={CreateTeamScreen} />
      <Stack.Screen name="PlayerDetails" component={PlayerDetailsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
    </Stack.Navigator>
  );
};